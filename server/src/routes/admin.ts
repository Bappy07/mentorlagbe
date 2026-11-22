
import { Router, type Request } from "express";
import { ObjectId, type Db } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";
import { createAuth } from "../config/auth.js";
import type { AuthGuards } from "../middleware/auth.js";

export function createAdminRouter(
  auth: ReturnType<typeof createAuth>,
  db: Db,
  guards: AuthGuards
) {
  const router = Router();

  const tuitions = db.collection("tuitions");
  const users = db.collection("users");
  const payments = db.collection("payments");
  const applications = db.collection("applications");

  async function isAdmin(req: Request) {
    if (req.authUser) {
      return req.authUser.role === "admin" ? req.authUser : null;
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) return null;

    const role = String(
      (session.user as typeof session.user & { role?: string }).role || ""
    );

    return role === "admin"
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: "admin" as const,
          plan: "free" as const,
        }
      : null;
  }

  function serialize(document: Record<string, unknown>) {
    return {
      ...document,
      _id: String(document._id),
    };
  }

  // Admin dashboard statistics
  router.get("/stats", guards.verifyAdmin, async (req, res) => {
    try {
      if (!(await isAdmin(req))) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const [
        totalUsers,
        totalStudents,
        totalTutors,
        totalTuitions,
        pendingTuitions,
        approvedTuitions,
        totalApplications,
        totalPayments,
        revenueResult,
      ] = await Promise.all([
        users.countDocuments(),
        users.countDocuments({ role: "student" }),
        users.countDocuments({ role: "tutor" }),
        tuitions.countDocuments(),
        tuitions.countDocuments({
          $or: [{ approvalStatus: "pending" }, { status: "pending" }],
        }),
        tuitions.countDocuments({
          $or: [{ approvalStatus: "approved" }, { status: "approved" }],
        }),
        applications.countDocuments(),
        payments.countDocuments(),
        payments
          .aggregate<{ _id: null; total: number }>([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ])
          .toArray(),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalStudents,
          totalTutors,
          totalTuitions,
          pendingTuitions,
          approvedTuitions,
          totalApplications,
          totalPayments,
          totalRevenue: revenueResult[0]?.total ?? 0,
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load dashboard statistics.",
      });
    }
  });

  // Get all tuition listings for admin moderation
  router.get("/tuitions", guards.verifyAdmin, async (req, res) => {
    try {
      const query = req.query as Record<string, string | undefined>;
      const status = String(query.status ?? "").trim();
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));

      const filter = status
        ? {
            $or: [{ approvalStatus: status }, { status }],
          }
        : {};

      const [results, total] = await Promise.all([
        tuitions
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        tuitions.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        count: results.length,
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        tuitions: results.map(serialize),
      });
    } catch (error) {
      console.error("Admin tuitions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load tuitions.",
      });
    }
  });

  // Get pending tuition listings
  router.get("/tuitions/pending", guards.verifyAdmin, async (req, res) => {
    try {
      if (!(await isAdmin(req))) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const results = await tuitions
        .find({
          $or: [
            { approvalStatus: "pending" },
            {
              approvalStatus: { $exists: false },
              status: "pending",
            },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        tuitions: results.map(serialize),
      });
    } catch (error) {
      console.error("Pending tuitions error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load pending tuitions.",
      });
    }
  });

  // Approve or reject a tuition listing
  router.patch("/tuitions/:id/status", guards.verifyAdmin, async (req, res) => {
    try {
      if (!(await isAdmin(req))) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const id = String(req.params.id);
      const { status } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be approved or rejected.",
        });
      }

      const result = await tuitions.updateOne(
        {
          _id: new ObjectId(id),
          $or: [
            { approvalStatus: "pending" },
            {
              approvalStatus: { $exists: false },
              status: "pending",
            },
          ],
        },
        {
          $set: {
            status,
            approvalStatus: status,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({
          success: false,
          message: "Pending tuition listing not found.",
        });
      }

      return res.json({
        success: true,
        message:
          status === "approved"
            ? "Tuition approved successfully."
            : "Tuition rejected successfully.",
      });
    } catch (error) {
      console.error("Moderate tuition error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update tuition status.",
      });
    }
  });

  // Get users
  router.get("/users", guards.verifyAdmin, async (req, res) => {
    try {
      if (!(await isAdmin(req))) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const results = await users
        .find(
          {},
          {
            projection: {
              id: 1,
              name: 1,
              email: 1,
              role: 1,
              plan: 1,
              image: 1,
              createdAt: 1,
              banned: 1,
            },
          }
        )
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        users: results.map(serialize),
      });
    } catch (error) {
      console.error("Admin users error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load users.",
      });
    }
  });

  // Change a user's role (admins cannot change their own role)
  router.patch("/users/:id/role", guards.verifyAdmin, async (req, res) => {
    try {
      const session = await isAdmin(req);

      if (!session) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const id = String(req.params.id);
      const { role } = req.body;

      if (!["student", "tutor", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be student, tutor or admin.",
        });
      }

      if (id === session.id) {
        return res.status(400).json({
          success: false,
          message: "You cannot change your own role.",
        });
      }

      const userQuery = ObjectId.isValid(id)
        ? {
            $or: [
              { id },
              { _id: new ObjectId(id) },
            ],
          }
        : { id };

      const targetUser = await users.findOne(userQuery);

      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      if (targetUser.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin roles cannot be changed here.",
        });
      }

      await users.updateOne(
        { _id: targetUser._id },
        {
          $set: {
            role,
            updatedAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,
        message: "User role updated successfully.",
      });
    } catch (error) {
      console.error("Update user role error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user role.",
      });
    }
  });

  // Get payment transactions
  router.get("/payments", guards.verifyAdmin, async (req, res) => {
    try {
      if (!(await isAdmin(req))) {
        return res.status(403).json({
          success: false,
          message: "Admin access required.",
        });
      }

      const results = await payments
        .find({})
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        payments: results.map(serialize),
      });
    } catch (error) {
      console.error("Admin payments error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load payment transactions.",
      });
    }
  });

  return router;
}
