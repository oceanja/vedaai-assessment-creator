import { Queue, QueueEvents } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Parse redis URL into host/port/password for BullMQ connection config
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

// ─── Queue names ──────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  GENERATION: "assignment-generation",
} as const;

// ─── Generation queue ─────────────────────────────────────────────────────────

export const generationQueue = new Queue(QUEUE_NAMES.GENERATION, {
  connection: connectionConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export const generationQueueEvents = new QueueEvents(QUEUE_NAMES.GENERATION, {
  connection: connectionConfig,
});

// ─── Job types ────────────────────────────────────────────────────────────────

export interface GenerationJobData {
  assignmentId: string;
}
