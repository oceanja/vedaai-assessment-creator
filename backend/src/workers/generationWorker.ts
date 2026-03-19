import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { QUEUE_NAMES, type GenerationJobData } from "../queues";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import { notifyAssignmentUpdate } from "../services/websocketService";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
function getRedisConfig(url: string) {
  try {
    const u = new URL(url);
    const isTLS = u.protocol === "rediss:";
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port) : (isTLS ? 6380 : 6379),
      password: u.password ? decodeURIComponent(u.password) : undefined,
      username: u.username && u.username !== "default" ? u.username : undefined,
      tls: isTLS ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null as null,
      enableReadyCheck: false,
    };
  } catch {
    return { host: "localhost", port: 6379, maxRetriesPerRequest: null as null, enableReadyCheck: false };
  }
}
const connectionConfig = getRedisConfig(REDIS_URL);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
    console.log("[Worker] MongoDB connected");
  }
}

const worker = new Worker<GenerationJobData>(
  QUEUE_NAMES.GENERATION,
  async (job) => {
    const { assignmentId } = job.data;
    console.log(`[Worker] Processing job ${job.id} for assignment ${assignmentId}`);

    await connectDB();

    // 1. Mark as processing
    await Assignment.findByIdAndUpdate(assignmentId, { status: "processing" });
    notifyAssignmentUpdate(assignmentId, "processing");

    // 2. Fetch the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    // 3. Generate question paper via AI
    const generatedPaper = await generateQuestionPaper(assignment.formData);

    // 4. Store result in MongoDB
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "done",
      generatedPaper,
    });

    // 5. Notify frontend via WebSocket
    notifyAssignmentUpdate(assignmentId, "done", generatedPaper);

    console.log(`[Worker] Done — assignment ${assignmentId}`);
    return { assignmentId, status: "done" };
  },
  {
    connection: connectionConfig,
    concurrency: 3,
  }
);

worker.on("failed", async (job, err) => {
  if (!job) return;
  const { assignmentId } = job.data;
  console.error(`[Worker] Job failed for ${assignmentId}:`, err.message);

  await connectDB();
  await Assignment.findByIdAndUpdate(assignmentId, {
    status: "error",
    errorMessage: err.message,
  });
  notifyAssignmentUpdate(assignmentId, "error", undefined, err.message);
});

worker.on("ready", () => {
  console.log("[Worker] Generation worker ready");
});

worker.on("error", (err) => {
  console.error("[Worker] Redis Connection error:", err.message);
});

export default worker;
