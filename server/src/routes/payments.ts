
import { Router, type RequestHandler } from "express";
import type { Db } from "mongodb";
import Stripe from "stripe";
import type { AuthGuards } from "../middleware/auth.js";

const PLAN_AMOUNTS = {
  tutor: 1500, // $15 / month equivalent
  student: 1000, // $10
} as const;

type PlanKey = keyof typeof PLAN_AMOUNTS;

function clientUrl() {
  return process.env.CLIENT_URL || "http://localhost:3000";
}

function createStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

function planLabel(plan: PlanKey) {
  return plan === "tutor" ? "Pro Tutor" : "Pro Student";
}

/** Idempotently records a paid session and upgrades the user in `users`. */
export async function syncPaidSession(db: Db, session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return null;

  const payments = db.collection("payments");
  const users = db.collection("users");

  const sessionId = session.id;
  const metadata = session.metadata ?? {};
  const planKey: PlanKey = metadata.plan === "tutor" ? "tutor" : "student";
  const email = metadata.userEmail || session.customer_email || "";
  const userId = metadata.userId || session.client_reference_id || "";

  const existing = await payments.findOne({ stripeSessionId: sessionId });
  if (existing) return existing;

  const record = {
    userEmail: email,
    userName: metadata.userName || "",
    userRole: metadata.userRole || planKey,
    planName: metadata.planName || planLabel(planKey),
    amount: (session.amount_total ?? PLAN_AMOUNTS[planKey]) / 100,
    currency: (session.currency || "usd").toUpperCase(),
    transactionId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || sessionId,
    stripeSessionId: sessionId,
    paymentStatus: "paid",
    paidAt: new Date(),
    createdAt: new Date(),
    userId,
  };

  await payments.updateOne(
    { stripeSessionId: sessionId },
    { $setOnInsert: record },
    { upsert: true }
  );

  if (email || userId) {
    const query = userId ? { $or: [{ id: userId }, { email }] } : { email };
    await users.updateOne(query, {
      $set: {
        plan: "pro",
        "subscription.plan": "pro",
        "subscription.expiresAt": new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
        updatedAt: new Date(),
      },
    });
  }

  return record;
}

/** Raw-body Stripe webhook handler. Mount before express.json(). */
export function createStripeWebhookHandler(db: Db): RequestHandler {
  return async (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers["stripe-signature"];

    if (!secret || !signature) {
      res.status(400).json({
        success: false,
        message: "Stripe webhook is not configured.",
      });
      return;
    }

    try {
      const stripe = createStripe();
      if (!stripe) {
        res.status(503).json({
          success: false,
          message: "Stripe is not configured on the server.",
        });
        return;
      }

      const event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        String(signature),
        secret
      );

      if (event.type === "checkout.session.completed") {
        await syncPaidSession(db, event.data.object as Stripe.Checkout.Session);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({
        success: false,
        message: "Invalid Stripe webhook signature.",
      });
    }
  };
}

export function createPaymentRouter(db: Db, guards: AuthGuards) {
  const router = Router();
  const users = db.collection("users");
  const { verifyToken } = guards;

  router.post("/checkout", verifyToken, async (req, res) => {
    try {
      const stripe = createStripe();

      if (!stripe) {
        res.status(503).json({
          success: false,
          message:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY to the server .env file.",
        });
        return;
      }

      const requested = String(req.body?.plan ?? "").toLowerCase();
      const plan: PlanKey =
        requested === "tutor" || requested === "student" ? requested : "student";

      const user = req.authUser!;
      const amount = PLAN_AMOUNTS[plan];
      const baseUrl = clientUrl();

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        client_reference_id: user.id,
        customer_email: user.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: amount,
              product_data: {
                name: `${planLabel(plan)} Plan`,
                description: `MentorLagbe ${plan} subscription upgrade`,
              },
            },
          },
        ],
        metadata: {
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          userRole: user.role,
          plan,
          planName: planLabel(plan),
        },
        success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/payment/cancel`,
      });

      res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to start Stripe checkout.",
      });
    }
  });

  // Fallback verification when a webhook cannot reach a local dev server.
  router.get("/verify/:sessionId", verifyToken, async (req, res) => {
    try {
      const stripe = createStripe();

      if (!stripe) {
        res.status(503).json({
          success: false,
          message: "Stripe is not configured on the server.",
        });
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(
        String(req.params.sessionId)
      );

      if (session.payment_status === "paid") {
        await syncPaidSession(db, session);
      }

      const email = req.authUser!.email;
      const user = await users.findOne({ email });

      res.json({
        success: true,
        paid: session.payment_status === "paid",
        plan: user?.plan ?? "free",
      });
    } catch (error) {
      console.error("Stripe verification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment.",
      });
    }
  });

  return router;
}
