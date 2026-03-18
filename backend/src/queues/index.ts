import { Queue, QueueEvents } from "bullmq";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Parse redis URL into host/port for BullMQ connection config
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname || "localhost",
    port: parseInt(parsed.port || "6379", 10),
  };
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
