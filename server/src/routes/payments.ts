
import { Router, type RequestHandler } from "express";
import { ObjectId, type Db } from "mongodb";
import type { AuthGuards } from "../middleware/auth.js";

const PLAN_AMOUNTS = {
  tutor: 1500,
  student: 1000,
} as const;

type PlanKey = keyof typeof PLAN_AMOUNTS;

function planLabel(plan: PlanKey) {
  return plan === "tutor" ? "Pro Tutor" : "Pro Student";
}

function getUserQuery(userId: string, email: string) {
  return {
    $or: [{ id: userId }, { email }],
  };
}

export function createPaymentRouter(db: Db, guards: AuthGuards) {
  const router = Router();
  const payments = db.collection("payments");
  const users = db.collection("users");
  const { verifyToken } = guards;

  const verifyAdmin: RequestHandler = (req, res, next) => {
    if (req.authUser?.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
      return;
    }

    next();
  };

  // Payment instructions for the submission form.
  router.get("/instructions", verifyToken, (_req, res) => {
    const bkashNumber = process.env.BKASH_NUMBER;

    if (!bkashNumber) {
      res.status(503).json({
        success: false,
        message: "bKash payment is not configured yet.",
      });
      return;
    }

    res.json({
      success: true,
      bkashNumber,
      currency: "BDT",
      plans: {
        student: { label: planLabel("student"), amount: PLAN_AMOUNTS.student },
        tutor: { label: planLabel("tutor"), amount: PLAN_AMOUNTS.tutor },
      },
    });
  });

  // Submit bKash payment details for manual admin verification.
  router.post("/checkout", verifyToken, async (req, res) => {
    try {
      const user = req.authUser!;
      const plan: PlanKey =
        user.role === "tutor" ? "tutor" : "student";

      if (user.role !== "student" && user.role !== "tutor") {
        res.status(403).json({
          success: false,
          message: "Only students and tutors can purchase Pro.",
        });
        return;
      }

      const bkashNumber = process.env.BKASH_NUMBER;

      if (!bkashNumber) {
        res.status(503).json({
          success: false,
          message: "bKash payment is not configured yet.",
        });
        return;
      }

      const senderNumber = String(
        req.body?.bkashSenderNumber ?? ""
      ).trim();

      const transactionId = String(
        req.body?.bkashTransactionId ?? ""
      )
        .trim()
        .toUpperCase();

      if (!/^01[3-9]\d{8}$/.test(senderNumber)) {
        res.status(400).json({
          success: false,
          message: "Enter a valid 11-digit bKash sender number.",
        });
        return;
      }

      if (!/^[A-Z0-9]{8,20}$/.test(transactionId)) {
        res.status(400).json({
          success: false,
          message: "Enter a valid bKash transaction ID.",
        });
        return;
      }

      const existingTransaction = await payments.findOne({
        bkashTransactionId: transactionId,
      });

      if (existingTransaction) {
        res.status(409).json({
          success: false,
          message: "This transaction ID has already been submitted.",
        });
        return;
      }

      const existingPending = await payments.findOne({
        userId: user.id,
        paymentStatus: "pending",
      });

      if (existingPending) {
        res.status(409).json({
          success: false,
          message: "You already have a payment awaiting verification.",
        });
        return;
      }

      const amount = PLAN_AMOUNTS[plan];
      const now = new Date();

      const payment = {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        userRole: user.role,
        plan,
        planName: planLabel(plan),
        amount,
        currency: "BDT",
        paymentMethod: "bkash",
        bkashNumber,
        bkashSenderNumber: senderNumber,
        bkashTransactionId: transactionId,
        paymentStatus: "pending",
        createdAt: now,
        updatedAt: now,
      };

      const result = await payments.insertOne(payment);

      res.status(201).json({
        success: true,
        message:
          "Payment submitted. Your Pro membership will activate after admin verification.",
        payment: {
          id: result.insertedId,
          amount,
          currency: "BDT",
          paymentStatus: "pending",
        },
      });
    } catch (error) {
      console.error("bKash payment submission error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit payment.",
      });
    }
  });

  // Get the current user's payment history.
  router.get("/my-payments", verifyToken, async (req, res) => {
    try {
      const user = req.authUser!;

      const history = await payments
        .find({ userId: user.id })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({
        success: true,
        payments: history,
      });
    } catch (error) {
      console.error("Payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load payment history.",
      });
    }
  });

  // Admin: view pending payments.
  router.get(
    "/admin/pending",
    verifyToken,
    verifyAdmin,
    async (_req, res) => {
      try {
        const pending = await payments
          .find({ paymentStatus: "pending" })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          payments: pending,
        });
      } catch (error) {
        console.error("Pending payments error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to load pending payments.",
        });
      }
    }
  );

  // Admin: approve a payment after checking it in the bKash account.
  router.patch(
    "/admin/:paymentId/approve",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      try {
        const paymentId = String(req.params.paymentId);

        if (!ObjectId.isValid(paymentId)) {
          res.status(400).json({
            success: false,
            message: "Invalid payment ID.",
          });
          return;
        }

        const payment = await payments.findOne({
          _id: new ObjectId(paymentId),
          paymentStatus: "pending",
        });

        if (!payment) {
          res.status(404).json({
            success: false,
            message: "Pending payment not found.",
          });
          return;
        }

        const userResult = await users.updateOne(
          getUserQuery(payment.userId, payment.userEmail),
          {
            $set: {
              plan: "pro",
              "subscription.plan": "pro",
              "subscription.expiresAt": new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
              updatedAt: new Date(),
            },
          }
        );

        if (userResult.matchedCount === 0) {
          res.status(404).json({
            success: false,
            message: "The payment's user account was not found.",
          });
          return;
        }

        await payments.updateOne(
          {
            _id: new ObjectId(paymentId),
            paymentStatus: "pending",
          },
          {
            $set: {
              paymentStatus: "completed",
              reviewedAt: new Date(),
              reviewedBy: req.authUser!.id,
              updatedAt: new Date(),
            },
          }
        );

        res.json({
          success: true,
          message: "Payment approved. Pro membership activated.",
        });
      } catch (error) {
        console.error("Payment approval error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to approve payment.",
        });
      }
    }
  );

  // Admin: reject a payment.
  router.patch(
    "/admin/:paymentId/reject",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      try {
        const paymentId = String(req.params.paymentId);

        if (!ObjectId.isValid(paymentId)) {
          res.status(400).json({
            success: false,
            message: "Invalid payment ID.",
          });
          return;
        }

        const result = await payments.updateOne(
          {
            _id: new ObjectId(paymentId),
            paymentStatus: "pending",
          },
          {
            $set: {
              paymentStatus: "failed",
              rejectionReason: String(
                req.body?.reason ?? "Payment could not be verified."
              ).slice(0, 300),
              reviewedAt: new Date(),
              reviewedBy: req.authUser!.id,
              updatedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount === 0) {
          res.status(404).json({
            success: false,
            message: "Pending payment not found.",
          });
          return;
        }

        res.json({
          success: true,
          message: "Payment rejected.",
        });
      } catch (error) {
        console.error("Payment rejection error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to reject payment.",
        });
      }
    }
  );

  return router;
}
