import { Queue, QueueEvents } from "bullmq";

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

export const QUEUE_NAMES = {
  GENERATION: "assignment-generation",
} as const;

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
  connection: getRedisConfig(REDIS_URL),
});

export interface GenerationJobData {
  assignmentId: string;
}
