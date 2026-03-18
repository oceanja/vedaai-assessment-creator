import { z } from "zod";

// ─── Difficulty ───────────────────────────────────────────────────────────────

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

// ─── Question Types ───────────────────────────────────────────────────────────

export const QuestionTypeRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  count: z.number().int().positive(),
  marks: z.number().int().positive(),
});
export type QuestionTypeRow = z.infer<typeof QuestionTypeRowSchema>;

// ─── Generated Paper Schema (Zod — validates AI output) ───────────────────────

export const GeneratedQuestionSchema = z.object({
  id: z.number(),
  text: z.string().min(1),
  difficulty: DifficultySchema,
  marks: z.number().positive(),
});

export const GeneratedSectionSchema = z.object({
  title: z.string(),
  questionTypeName: z.string(),
  instruction: z.string(),
  questions: z.array(GeneratedQuestionSchema),
});

export const GeneratedAnswerSchema = z.object({
  questionId: z.number(),
  sectionTitle: z.string(),
  answer: z.string(),
});

export const GeneratedPaperSchema = z.object({
  schoolName: z.string(),
  subject: z.string(),
  className: z.string(),
  timeAllowed: z.string(),
  maxMarks: z.number(),
  generalInstruction: z.string(),
  sections: z.array(GeneratedSectionSchema),
  answerKey: z.array(GeneratedAnswerSchema),
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GeneratedSection = z.infer<typeof GeneratedSectionSchema>;
export type GeneratedAnswer = z.infer<typeof GeneratedAnswerSchema>;
export type GeneratedPaper = z.infer<typeof GeneratedPaperSchema>;

// ─── Assignment Status ────────────────────────────────────────────────────────

export type AssignmentStatus = "pending" | "queued" | "processing" | "done" | "error";

// ─── Assignment Form Data ─────────────────────────────────────────────────────

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  timeAllowed: string;
  questionTypes: QuestionTypeRow[];
  additionalInstructions: string;
  uploadedFileUrl?: string;
}

// ─── WebSocket Messages ───────────────────────────────────────────────────────

export interface WSStatusUpdateMessage {
  type: "status_update";
  assignmentId: string;
  status: AssignmentStatus;
  data?: GeneratedPaper;
  error?: string;
}
