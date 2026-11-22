
import { Router } from "express";
import type { Db } from "mongodb";
import type { AuthGuards } from "../middleware/auth.js";

export function createUserRouter(db: Db, guards: AuthGuards) {
  const router = Router();
  const users = db.collection("users");

  router.get("/me", guards.verifyToken, async (req, res) => {
    try {
      const user = await users.findOne({ email: req.authUser!.email });

      res.json({
        success: true,
        user: {
          id: req.authUser!.id,
          name: user?.name ?? req.authUser!.name,
          email: req.authUser!.email,
          role: req.authUser!.role,
          plan: req.authUser!.plan,
          image: user?.image ?? "",
          phone: user?.phone ?? "",
          bio: user?.bio ?? "",
          savedTuitions: Array.isArray(user?.savedTuitions)
            ? user.savedTuitions
            : [],
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ success: false, message: "Failed to load profile." });
    }
  });

  router.patch("/profile", guards.verifyToken, async (req, res) => {
    try {
      const { name, phone, bio, image } = req.body ?? {};
      const updates: Record<string, unknown> = {};

      if (typeof name === "string" && name.trim()) {
        updates.name = name.trim();
      }
      if (typeof phone === "string") updates.phone = phone.trim().slice(0, 30);
      if (typeof bio === "string") updates.bio = bio.trim().slice(0, 1000);
      if (typeof image === "string") updates.image = image.trim();

      await users.updateOne(
        { email: req.authUser!.email },
        { $set: { ...updates, updatedAt: new Date() } }
      );

      res.json({ success: true, message: "Profile updated successfully." });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ success: false, message: "Failed to update profile." });
    }
  });

  router.get("/saved", guards.verifyToken, async (req, res) => {
    try {
      const user = await users.findOne({ email: req.authUser!.email });
      res.json({
        success: true,
        savedTuitions: Array.isArray(user?.savedTuitions)
          ? user.savedTuitions
          : [],
      });
    } catch (error) {
      console.error("Get saved tuitions error:", error);
      res.status(500).json({ success: false, message: "Failed to load saved tuitions." });
    }
  });

  router.post("/saved/:id", guards.verifyToken, async (req, res) => {
    try {
      await users.updateOne(
        { email: req.authUser!.email },
        { $addToSet: { savedTuitions: String(req.params.id) } }
      );
      res.json({ success: true, message: "Tuition saved." });
    } catch (error) {
      console.error("Save tuition error:", error);
      res.status(500).json({ success: false, message: "Failed to save tuition." });
    }
  });

  router.delete("/saved/:id", guards.verifyToken, async (req, res) => {
    try {
      await users.updateOne(
        { email: req.authUser!.email },
        { $pull: { savedTuitions: String(req.params.id) } } as never
      );
      res.json({ success: true, message: "Tuition removed from saved list." });
    } catch (error) {
      console.error("Unsave tuition error:", error);
      res.status(500).json({ success: false, message: "Failed to unsave tuition." });
    }
  });

  return router;
}
