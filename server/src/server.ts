
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";

import { connectDB } from "./config/db.js";
import { createIndexes } from "./config/indexes.js";
import { createAuth } from "./config/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

async function startServer() {
  try {
    const db = await connectDB();

    await createIndexes();

    const auth = createAuth(db);

    // Better Auth must come before express.json().
    app.all("/api/auth/{*any}", toNodeHandler(auth));

    app.use(express.json());

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

    app.listen(PORT, () => {
      console.log(`MentorLagbe server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
