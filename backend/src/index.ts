import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import assignmentRoutes from "./routes/assignments";
import { setupWebSocketServer } from "./services/websocketService";
import fs from "fs";

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Global error handlers (prevent Railway crashes) ──────────────────────────

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️  Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit — log and continue
});

process.on("uncaughtException", (err) => {
  console.error("⚠️  Uncaught Exception:", err);
  // Don't exit — log and continue (Railway will restart if truly fatal)
});

// ─── Express setup ────────────────────────────────────────────────────────────

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:3000", /\.vercel\.app$/, /\.railway\.app$/],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(uploadsDir));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/assignments", assignmentRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── HTTP + WebSocket server ──────────────────────────────────────────────────

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/" });
setupWebSocketServer(wss);

// ─── MongoDB + Start ──────────────────────────────────────────────────────────

async function start() {
  try {
    // Set mongoose options for production stability
    mongoose.set("bufferCommands", false);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB connected");

    // Import worker AFTER MongoDB is connected (prevents race condition)
    try {
      await import("./workers/generationWorker");
      console.log("✅ Worker loaded");
    } catch (workerErr) {
      console.error("⚠️  Worker failed to load (Redis may be unavailable):", workerErr);
      // Server still runs — just without background processing
    }

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ WebSocket ready`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  
  server.close(() => {
    console.log("  HTTP server closed");
  });
  
  wss.close(() => {
    console.log("  WebSocket server closed");
  });

  try {
    await mongoose.disconnect();
    console.log("  MongoDB disconnected");
  } catch (e) {
    console.error("  Error disconnecting MongoDB:", e);
  }

  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

start();

export default app;
