
import { Router } from "express";
import multer from "multer";
import type { AuthGuards } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Only image files are allowed."));
    }
  },
});

export function createUploadRouter(guards: AuthGuards) {
  const router = Router();
  const { verifyToken } = guards;

  router.post("/image", verifyToken, upload.single("image"), async (req, res) => {
    try {
      const apiKey = process.env.IMGBB_API_KEY;

      if (!apiKey) {
        res.status(503).json({
          success: false,
          message:
            "Image upload is not configured yet. Add IMGBB_API_KEY to the server .env file.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Please choose an image to upload.",
        });
        return;
      }

      const form = new FormData();
      form.append("key", apiKey);
      form.append(
        "image",
        new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }),
        req.file.originalname
      );

      const response = await fetch(
        `https://api.imgbb.com/1/upload?expiration=0&key=${encodeURIComponent(apiKey)}`,
        { method: "POST", body: form }
      );
      const result = (await response.json()) as {
        success?: boolean;
        data?: { url?: string; display_url?: string; delete_url?: string };
        error?: { message?: string };
      };

      if (!result.success || !result.data?.url) {
        res.status(502).json({
          success: false,
          message: result.error?.message || "ImgBB rejected the upload.",
        });
        return;
      }

      res.json({
        success: true,
        imageUrl: result.data.url,
        displayUrl: result.data.display_url ?? result.data.url,
        deleteUrl: result.data.delete_url,
      });
    } catch (error) {
      console.error("ImgBB upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload image.",
      });
    }
  });

  // Alias used by the tuition form.
  router.post("/banner", verifyToken, upload.single("image"), async (req, res) => {
    try {
      const apiKey = process.env.IMGBB_API_KEY;

      if (!apiKey) {
        res.status(503).json({
          success: false,
          message:
            "Image upload is not configured yet. Add IMGBB_API_KEY to the server .env file.",
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "Please choose a banner image.",
        });
        return;
      }

      const form = new FormData();
      form.append("key", apiKey);
      form.append(
        "image",
        new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype }),
        req.file.originalname
      );

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
        { method: "POST", body: form }
      );
      const result = (await response.json()) as {
        success?: boolean;
        data?: { url?: string; display_url?: string; delete_url?: string };
      };

      if (!result.success || !result.data?.url) {
        res.status(502).json({
          success: false,
          message: "ImgBB rejected the banner upload.",
        });
        return;
      }

      res.json({ success: true, imageUrl: result.data.url });
    } catch (error) {
      console.error("ImgBB banner upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload banner image.",
      });
    }
  });

  return router;
}
