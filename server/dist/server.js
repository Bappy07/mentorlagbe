import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { createIndexes } from "./config/indexes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
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
async function startServer() {
    try {
        await connectDB();
        await createIndexes();
        app.listen(PORT, () => {
            console.log(`MentorLagbe server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
