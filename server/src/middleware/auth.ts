
import type { NextFunction, Request, Response } from "express";
import type { Db } from "mongodb";
import jwt from "jsonwebtoken";
import { fromNodeHeaders } from "better-auth/node";
import { createAuth } from "../config/auth.js";

export type UserRole = "student" | "tutor" | "admin";
export type Plan = "free" | "pro";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: Plan;
  image?: string;
}

interface JwtPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  plan: Plan;
}

function normalizeRole(value: unknown): UserRole {
  return value === "tutor" || value === "admin" ? value : "student";
}

function normalizePlan(value: unknown): Plan {
  return value === "pro" ? "pro" : "free";
}

/**
 * Creates the reusable JWT / role guards required by the API.
 *
 * A request can authenticate either with a Bearer JWT (issued by
 * POST /api/auth/token after a Better Auth login) or with the Better Auth
 * session cookie. The cookie fallback keeps public pages and older clients
 * working, while the JWT path is what protected dashboards use.
 */
export function createAuthGuards(auth: ReturnType<typeof createAuth>, db: Db) {
  const users = db.collection("users");

  async function userFromToken(token: string): Promise<AuthUser | null> {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    try {
      const payload = jwt.verify(token, secret) as JwtPayload;

      // Read the latest role/plan from the database so a role change or a
      // Stripe upgrade is reflected immediately, without waiting for the
      // token to expire.
      const record = await users.findOne({
        $or: [{ id: payload.sub }, { email: payload.email }],
      });

      if (!record) {
        return {
          id: payload.sub,
          name: String(payload.name ?? ""),
          email: payload.email,
          role: payload.role,
          plan: payload.plan,
        };
      }

      return {
        id: String(record.id ?? payload.sub),
        name: String(record.name ?? ""),
        email: String(record.email),
        role: normalizeRole(record.role ?? payload.role),
        plan: normalizePlan(record.plan ?? payload.plan),
        image: typeof record.image === "string" ? record.image : undefined,
      };
    } catch {
      return null;
    }
  }

  async function userFromSession(req: Request): Promise<AuthUser | null> {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) return null;

    const record = await users.findOne({ email: session.user.email });

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: normalizeRole(
        record?.role ??
          (session.user as typeof session.user & { role?: string }).role
      ),
      plan: normalizePlan(record?.plan ?? record?.subscription?.plan),
    };
  }

  async function verifyToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authorization = req.headers.authorization;
      const bearer = authorization?.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

      const user = bearer
        ? await userFromToken(bearer)
        : await userFromSession(req);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Please sign in to continue.",
        });
        return;
      }

      req.authUser = user;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }
  }

  function verifyRole(role: UserRole) {
    return async (req: Request, res: Response, next: NextFunction) => {
      await verifyToken(req, res, () => {
        if (req.authUser?.role !== role) {
          res.status(403).json({
            success: false,
            message: `Only ${role}s can perform this action.`,
          });
          return;
        }
        next();
      });
    };
  }

  return {
    verifyToken,
    verifyStudent: verifyRole("student"),
    verifyTutor: verifyRole("tutor"),
    verifyAdmin: verifyRole("admin"),
  };
}

export type AuthGuards = ReturnType<typeof createAuthGuards>;
