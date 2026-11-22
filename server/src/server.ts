
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";

import { connectDB } from "./config/db.js";
import { createIndexes } from "./config/indexes.js";
import { createAuth } from "./config/auth.js";
import { createAuthGuards } from "./middleware/auth.js";
import { createTuitionRouter } from "./routes/tuitions.js";
import { createApplicationRouter } from "./routes/applications.js";
import { createAdminRouter } from "./routes/admin.js";
import { createPaymentRouter } from "./routes/payments.js";
import { createUploadRouter } from "./routes/upload.js";
import { createUserRouter } from "./routes/user.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

function allowedOrigins() {
  const values = [
    process.env.CLIENT_URL,
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    // Local dev + deployed Vercel origin. Extra origins can be added via env.
    "http://localhost:3000",
    "https://mentorlagbe-drab.vercel.app",
  ].filter((value): value is string => Boolean(value));

  return Array.from(
    new Set(
      values.flatMap((value) => value.split(",").map((v) => v.trim()))
    )
  ).filter(Boolean);
}

app.use(
  cors({
    origin: allowedOrigins(),
    credentials: true,
  })
);

async function startServer() {
  try {
    const db = await connectDB();

    await createIndexes();

    const auth = createAuth(db);
    const guards = createAuthGuards(auth, db);

    // Issue a JWT after a successful cookie-based Better Auth login.
    app.post("/api/auth/token", async (req: Request, res: Response) => {
      try {
        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
          res.status(401).json({
            success: false,
            message: "Please sign in first.",
          });
          return;
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
          res.status(503).json({
            success: false,
            message: "JWT_SECRET is not configured on the server.",
          });
          return;
        }

        const role =
          (session.user as typeof session.user & { role?: string }).role ||
          "student";

        const record = await db.collection("users").findOne({
          email: session.user.email,
        });

        const plan = record?.plan === "pro" ? "pro" : "free";

        const token = jwt.sign(
          {
            sub: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role,
            plan,
          },
          secret,
          { expiresIn: "7d" }
        );

        res.json({
          success: true,
          token,
          user: { ...session.user, role, plan },
        });
      } catch (error) {
        console.error("JWT issue error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to issue token.",
        });
      }
    });

    app.all("/api/auth/{*any}", toNodeHandler(auth));

    app.use(express.json({ limit: "2mb" }));

    app.use("/api/tuitions", createTuitionRouter(auth, db, guards));
    app.use("/api/applications", createApplicationRouter(auth, db, guards));
    app.use("/api/admin", createAdminRouter(auth, db, guards));
    app.use("/api/payments", createPaymentRouter(db, guards));
    app.use("/api/upload", createUploadRouter(guards));
    app.use("/api/user", createUserRouter(db, guards));

    app.get("/", (_req, res) => {
      res.json({
        success: true,
        message: "MentorLagbe API is running!",
      });
    });

    app.get("/api/health", (_req, res) => {
      res.json({
        success: true,
        message: "Server is healthy.",
      });
    });

    app.use((_req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: "API route not found.",
      });
    });

    app.use(
      (
        error: unknown,
        _req: Request,
        res: Response,
        _next: NextFunction
      ) => {
        console.error("Unhandled API error:", error);

        const message =
          error instanceof Error && error.message.includes("image")
            ? error.message
            : "Something went wrong on the server.";

        res.status(500).json({ success: false, message });
      }
    );

    app.listen(PORT, () => {
      console.log(`MentorLagbe server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
