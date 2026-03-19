import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { QUEUE_NAMES, type GenerationJobData } from "../queues";
import { Assignment } from "../models/Assignment";
import { generateQuestionPaper } from "../services/aiService";
import { notifyAssignmentUpdate } from "../services/websocketService";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  const config: { host: string; port: number; password?: string; username?: string; tls?: object } = {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
  };
  if (parsed.password) config.password = decodeURIComponent(parsed.password);
  if (parsed.username && parsed.username !== "default") config.username = parsed.username;
  if (parsed.protocol === "rediss:") config.tls = {};
  return config;
}
const connectionConfig = parseRedisUrl(REDIS_URL);

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

export default worker;
