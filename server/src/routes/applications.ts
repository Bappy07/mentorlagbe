
import { Router, type Request } from "express";
import { ObjectId, type Db } from "mongodb";
import { fromNodeHeaders } from "better-auth/node";
import { createAuth } from "../config/auth.js";
import type { AuthGuards } from "../middleware/auth.js";

interface SessionLike {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export function createApplicationRouter(
  auth: ReturnType<typeof createAuth>,
  db: Db,
  guards: AuthGuards
) {
  const router = Router();

  const applications = db.collection("applications");
  const tuitions = db.collection("tuitions");

  async function getSession(req: Request): Promise<SessionLike | null> {
    if (req.authUser) {
      return {
        user: {
          id: req.authUser.id,
          name: req.authUser.name,
          email: req.authUser.email,
          role: req.authUser.role,
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
      },
    };
  }

  function getRole(session: SessionLike) {
    return String(
      (session.user as typeof session.user & { role?: string }).role || ""
    );
  }

  function serialize(application: Record<string, unknown>) {
    return {
      ...application,
      _id: String(application._id),
      tuitionId: String(application.tuitionId),
    };
  }

  // Student: Get their own applications
  router.get("/", guards.verifyStudent, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can view their applications here.",
        });
      }

      const results = await applications
        .find({ studentId: session.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        applications: results.map(serialize),
      });
    } catch (error) {
      console.error("Get student applications error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load applications.",
      });
    }
  });

  // Tutor: Get applications received for their own tuition listings
  router.get("/tutor", guards.verifyTutor, async (req, res) => {
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
          message: "Only tutors can view received applications.",
        });
      }

      const results = await applications
        .find({ tutorId: session.user.id })
        .sort({ createdAt: -1 })
        .toArray();

      return res.json({
        success: true,
        count: results.length,
        applications: results.map(serialize),
      });
    } catch (error) {
      console.error("Get tutor applicants error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load applicants.",
      });
    }
  });

  // Student: Apply for an approved and active tuition
  router.post("/:tuitionId", guards.verifyStudent, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can apply for tuition.",
        });
      }

      const tuitionId = String(req.params.tuitionId);

      if (!ObjectId.isValid(tuitionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
      }

      const phone =
        typeof req.body.phone === "string"
          ? req.body.phone.trim()
          : typeof req.body.studentPhone === "string"
            ? req.body.studentPhone.trim()
            : "";

      const preferredSchedule =
        typeof req.body.preferredSchedule === "string"
          ? req.body.preferredSchedule.trim()
          : "";

      const studentNote =
        typeof req.body.studentNote === "string"
          ? req.body.studentNote.trim()
          : "";

      if (!phone || phone.length < 8 || phone.length > 20) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid phone number.",
        });
      }

      if (
        !preferredSchedule ||
        preferredSchedule.length < 3 ||
        preferredSchedule.length > 200
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide your preferred schedule.",
        });
      }

      if (studentNote.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Your learning note must be under 1000 characters.",
        });
      }

      const tuition = await tuitions.findOne({
        _id: new ObjectId(tuitionId),
        $or: [
          { approvalStatus: "approved" },
          { status: "approved" },
        ],
        isActive: { $ne: false },
      });

      if (!tuition) {
        return res.status(404).json({
          success: false,
          message: "This tuition is not available.",
        });
      }

      if (tuition.tutorId === session.user.id) {
        return res.status(403).json({
          success: false,
          message: "You cannot apply to your own tuition.",
        });
      }

      const existingApplication = await applications.findOne({
        tuitionId: new ObjectId(tuitionId),
        studentId: session.user.id,
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: "You have already applied for this tuition.",
        });
      }

      const now = new Date();

      const application = {
        tuitionId: new ObjectId(tuitionId),

        tutorId: tuition.tutorId,
        tutorName: tuition.tutorName,
        tutorEmail: tuition.tutorEmail,

        studentId: session.user.id,
        studentName: session.user.name,
        studentEmail: session.user.email,
        studentPhone: phone,
        phone,

        tuitionTitle: tuition.title,
        subject: Array.isArray(tuition.subjects)
          ? tuition.subjects[0]
          : tuition.subject || "",
        monthlyFee: tuition.monthlyFee ?? tuition.salary ?? 0,
        preferredSchedule,
        studentNote,

        status: "pending",
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await applications.insertOne(application);

      return res.status(201).json({
        success: true,
        message: "Your application has been submitted successfully.",
        applicationId: result.insertedId.toString(),
      });
    } catch (error) {
      console.error("Submit application error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit application.",
      });
    }
  });

  // Tutor: Accept or reject an application
  router.patch("/:applicationId/status", guards.verifyTutor, async (req, res) => {
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
          message: "Only tutors can manage applications.",
        });
      }

      const applicationId = String(req.params.applicationId);
      const { status } = req.body;

      if (!ObjectId.isValid(applicationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID.",
        });
      }

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be accepted or rejected.",
        });
      }

      const application = await applications.findOne({
        _id: new ObjectId(applicationId),
        tutorId: session.user.id,
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      if (application.status !== "pending") {
        return res.status(409).json({
          success: false,
          message: "This application has already been reviewed.",
        });
      }

      await applications.updateOne(
        {
          _id: new ObjectId(applicationId),
          tutorId: session.user.id,
          status: "pending",
        },
        {
          $set: {
            status,
            updatedAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,
        message:
          status === "accepted"
            ? "Student application accepted."
            : "Student application rejected.",
      });
    } catch (error) {
      console.error("Update application status error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update application.",
      });
    }
  });

  // Student: Cancel their own pending application
  router.delete("/:id", guards.verifyStudent, async (req, res) => {
    try {
      const session = await getSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Please sign in first.",
        });
      }

      if (getRole(session) !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can cancel applications.",
        });
      }

      const id = String(req.params.id);

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID.",
        });
      }

      const result = await applications.deleteOne({
        _id: new ObjectId(id),
        studentId: session.user.id,
        status: "pending",
      });

      if (!result.deletedCount) {
        return res.status(404).json({
          success: false,
          message: "Pending application not found.",
        });
      }

      return res.json({
        success: true,
        message: "Application cancelled successfully.",
      });
    } catch (error) {
      console.error("Cancel application error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to cancel application.",
      });
    }
  });

  return router;
}
