
import { Router, type Request } from "express";
import { ObjectId, type Db, type Document, type Filter } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";
import { createAuth } from "../config/auth.js";
import type { AuthGuards } from "../middleware/auth.js";

interface SessionLike {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    plan?: string;
  };
}

export function createTuitionRouter(
  auth: ReturnType<typeof createAuth>,
  db: Db,
  guards: AuthGuards
) {
  const router = Router();
  const tuitions = db.collection("tuitions");
  const users = db.collection("users");
  const applications = db.collection("applications");

  async function getSession(req: Request): Promise<SessionLike | null> {
    if (req.authUser) {
      return {
        user: {
          id: req.authUser.id,
          name: req.authUser.name,
          email: req.authUser.email,
          role: req.authUser.role,
          plan: req.authUser.plan,
        },
      };
    }

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) return null;

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as typeof session.user & { role?: string }).role,
        plan: String(
          (session.user as typeof session.user & { plan?: string }).plan ?? "free"
        ),
      },
    };
  }

  function getRole(session: SessionLike) {
    return String(
      (session.user as typeof session.user & { role?: string }).role || ""
    );
  }

  function validId(id: string) {
    return ObjectId.isValid(id);
  }

  function serialize(tuition: Record<string, unknown>) {
    return {
      ...tuition,
      _id: String(tuition._id),
    };
  }

  function validateTuition(body: Record<string, unknown>) {
    const {
      title,
      description,
      classLevel,
      subjects,
      salary,
      monthlyFee,
      daysPerWeek,
      hoursPerDay,
    } = body;

    const cleanSubjects = Array.isArray(subjects)
      ? subjects
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const fee = monthlyFee ?? salary;
    const days = Number(daysPerWeek);
    const hours = Number(hoursPerDay ?? 1);

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 120 ||
      typeof description !== "string" ||
      description.trim().length < 20 ||
      typeof classLevel !== "string" ||
      !classLevel.trim() ||
      cleanSubjects.length === 0 ||
      cleanSubjects.length !==
        (Array.isArray(subjects) ? subjects.length : 0) ||
      typeof fee !== "number" ||
      !Number.isFinite(fee) ||
      fee <= 0 ||
      !Number.isInteger(days) ||
      days < 1 ||
      days > 7 ||
      !Number.isFinite(hours) ||
      hours <= 0 ||
      hours > 12
    ) {
      return null;
    }

    const mode = body.mode ?? body.tuitionType;

    if (!["online", "offline", "home"].includes(String(mode).toLowerCase())) {
      return null;
    }

    const normalizedMode =
      String(mode).toLowerCase() === "online" ? "online" : "offline";

    const location =
      normalizedMode === "online"
        ? "Online"
        : typeof body.location === "string"
          ? body.location.trim()
          : "";

    if (!location) return null;

    return {
      title: title.trim(),
      description: description.trim(),
      classLevel: classLevel.trim(),
      subjects: cleanSubjects,
      salary: fee,
      monthlyFee: fee,
      daysPerWeek: days,
      hoursPerDay: hours,
      tuitionType: normalizedMode === "online" ? "online" : "home",
      mode: normalizedMode,
      location,
      preferredGender: ["male", "female", "any"].includes(
        String(body.preferredGender)
      )
        ? body.preferredGender
        : "any",
      bannerImage:
        typeof body.bannerImage === "string" ? body.bannerImage : "",
    };
  }

  // Tutor: Get their own tuition listings
  router.get("/", guards.verifyTutor, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "tutor") {
        return res.status(403).json({
          success: false,
          message: "Only tutors can manage their tuition listings.",
        });
      }

      const results = await tuitions
        .find({ tutorId: session.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        tuitions: results.map(serialize),
      });
    } catch (error) {
      console.error("Get tutor tuitions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load your tuitions.",
      });
    }
  });

  // Public: server-side search, filter and pagination for approved tuitions
  router.get("/approved", async (req, res) => {
    try {
      const query = req.query as Record<string, string | undefined>;
      const searchTerm = String(query.q ?? query.search ?? "").trim();
      const subject = String(query.subject ?? "").trim();
      const classLevel = String(query.classLevel ?? "").trim();
      const rawMode = String(query.mode ?? query.tuitionType ?? "").trim();
      const mode = rawMode ? rawMode.toLowerCase() : "";
      const minFee = Number(query.minFee);
      const maxFee = Number(query.maxFee);
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(24, Math.max(1, Number(query.limit) || 9));

      const escapeRegex = (value: string) =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = (value: string) => ({
        $regex: escapeRegex(value),
        $options: "i",
      });

      const conditions: Filter<Document>[] = [
        {
          $or: [{ approvalStatus: "approved" }, { status: "approved" }],
        },
        { isActive: { $ne: false } },
      ];

      if (searchTerm) {
        conditions.push({
          $or: [
            { title: regex(searchTerm) },
            { subjects: regex(searchTerm) },
            { subject: regex(searchTerm) },
            { tutorName: regex(searchTerm) },
          ],
        });
      }

      if (subject) {
        conditions.push({ $or: [{ subjects: regex(subject) }, { subject: regex(subject) }] });
      }

      if (classLevel) conditions.push({ classLevel: regex(classLevel) });

      if (mode === "online" || mode === "offline") {
        conditions.push({ mode });
      }

      if (Number.isFinite(minFee) && query.minFee && minFee > 0) {
        conditions.push({ monthlyFee: { $gte: minFee } });
      }

      if (Number.isFinite(maxFee) && query.maxFee && maxFee > 0) {
        conditions.push({ monthlyFee: { $lte: maxFee } });
      }

      const filter: Filter<Document> = { $and: conditions };
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
      console.error("Get approved tuitions error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load available tuitions.",
      });
    }
  });

  // Tutor: Create a tuition listing
  router.post("/", guards.verifyTutor, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "tutor") {
        return res.status(403).json({
          success: false,
          message: "Only tutors can post tuition listings.",
        });
      }

      const data = validateTuition(req.body);

      if (!data) {
        return res.status(400).json({
          success: false,
          message: "Please complete all tuition fields correctly.",
        });
      }

      const user = await users.findOne({ email: session.user.email });
      const plan = user?.plan ?? user?.subscription?.plan ?? "free";

      const currentCount = await tuitions.countDocuments({
        tutorId: session.user.id,
      });

      if (plan !== "pro" && currentCount >= 2) {
        return res.status(403).json({
          success: false,
          message:
            "Free tutors can post up to 2 tuitions. Upgrade to Pro for unlimited posts.",
          upgradeRequired: true,
        });
      }

      const now = new Date();

      const tuition = {
        ...data,
        subject: data.subjects[0],
        tutorId: session.user.id,
        tutorName: session.user.name,
        tutorEmail: session.user.email,
        status: "pending",
        approvalStatus: "pending",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const result = await tuitions.insertOne(tuition);

      return res.status(201).json({
        success: true,
        message: "Tuition submitted for admin approval.",
        tuitionId: result.insertedId.toString(),
      });
    } catch (error) {
      console.error("Create tuition error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create tuition.",
      });
    }
  });

  // Tutor: View own listing. Public users: View approved active listings.
  router.get("/:id", async (req, res) => {
    try {
      const id = String(req.params.id);

      if (!validId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
      }

      const objectId = new ObjectId(id);
      const session = await getSession(req);

      // First, allow a tutor to view their own listing,
      // regardless of approval status or active status.
      if (session && getRole(session) === "tutor") {
        const ownTuition = await tuitions.findOne({
          _id: objectId,
          tutorId: session.user.id,
        });

        if (ownTuition) {
          return res.json({
            success: true,
            tuition: serialize(ownTuition),
          });
        }
      }

      // Everyone else can only view approved and active listings.
      const tuition = await tuitions.findOne({
        _id: objectId,
        $and: [
          {
            $or: [
              { approvalStatus: "approved" },
              { status: "approved" },
            ],
          },
          { isActive: { $ne: false } },
        ],
      });

      if (!tuition) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found or unavailable.",
        });
      }

      return res.json({
        success: true,
        tuition: serialize(tuition),
      });
    } catch (error) {
      console.error("Get tuition details error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to load tuition details.",
      });
    }
  });

  // Tutor: Update their own pending listing
  router.put("/:id", guards.verifyTutor, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "tutor") {
        return res.status(403).json({
          success: false,
          message: "Only tutors can edit tuition listings.",
        });
      }

      const id = String(req.params.id);

      if (!validId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
      }

      const data = validateTuition(req.body);

      if (!data) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid tuition details.",
        });
      }

      const result = await tuitions.updateOne(
        {
          _id: new ObjectId(id),
          tutorId: session.user.id,
          $or: [
            { approvalStatus: "pending" },
            { status: "pending" },
          ],
        },
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found or can no longer be edited.",
        });
      }

      return res.json({
        success: true,
        message: "Tuition updated successfully.",
      });
    } catch (error) {
      console.error("Update tuition error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update tuition.",
      });
    }
  });

  // Tutor: Activate or close an approved listing
  router.patch("/:id/active", guards.verifyTutor, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "tutor") {
        return res.status(403).json({
          success: false,
          message: "Only tutors can change listing status.",
        });
      }

      const id = String(req.params.id);
      const { isActive } = req.body;

      if (!validId(id) || typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID or active status.",
        });
      }

      const result = await tuitions.updateOne(
        {
          _id: new ObjectId(id),
          tutorId: session.user.id,
          $or: [
            { approvalStatus: "approved" },
            { status: "approved" },
          ],
        },
        {
          $set: {
            isActive,
            updatedAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({
          success: false,
          message: "Approved tuition not found.",
        });
      }

      return res.json({
        success: true,
        message: isActive ? "Tuition activated." : "Tuition closed.",
      });
    } catch (error) {
      console.error("Toggle tuition error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update tuition status.",
      });
    }
  });

  // Tutor: Delete their own listing if nobody has applied
  router.delete("/:id", guards.verifyTutor, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "tutor") {
        return res.status(403).json({
          success: false,
          message: "Only tutors can delete tuition listings.",
        });
      }

      const id = String(req.params.id);

      if (!validId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
      }

      const tuition = await tuitions.findOne({
        _id: new ObjectId(id),
        tutorId: session.user.id,
      });

      if (!tuition) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found.",
        });
      }

      const applicationCount = await applications.countDocuments({
        tuitionId: new ObjectId(id),
      });

      if (applicationCount > 0) {
        return res.status(409).json({
          success: false,
          message:
            "This tuition has applications. Close it instead of deleting it.",
        });
      }

      await tuitions.deleteOne({ _id: new ObjectId(id) });

      return res.json({
        success: true,
        message: "Tuition deleted successfully.",
      });
    } catch (error) {
      console.error("Delete tuition error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete tuition.",
      });
    }
  });

  return router;
}
