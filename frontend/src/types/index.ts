// ─── Question Types ──────────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionTypeOption =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Long Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "True/False"
  | "Fill in the Blanks"
  | "Essay Questions";

export const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "True/False",
  "Fill in the Blanks",
  "Essay Questions",
];

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface QuestionTypeRow {
  id: string;
  type: QuestionTypeOption;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  timeAllowed: string;
  questionTypes: QuestionTypeRow[];
  additionalInstructions: string;
  uploadedFile: File | null;
  uploadedFileUrl?: string;
}

// ─── Generated Paper Types ───────────────────────────────────────────────────

export interface GeneratedQuestion {
  id: number;
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
}

export interface GeneratedSection {
  title: string;           // "Section A"
  questionTypeName: string; // "Short Answer Questions"
  instruction: string;     // "Attempt all questions. Each question carries 2 marks"
  questions: GeneratedQuestion[];
}

export interface GeneratedAnswer {
  questionId: number;
  sectionTitle: string;
  answer: string;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstruction: string;
  sections: GeneratedSection[];
  answerKey: GeneratedAnswer[];
}

// ─── Assignment Types ─────────────────────────────────────────────────────────

export type AssignmentStatus = "pending" | "queued" | "processing" | "done" | "error";

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  assignedDate: string;
  status: AssignmentStatus;
  generatedPaper?: GeneratedPaper;
  formData: AssignmentFormData;
  createdAt: string;
  updatedAt: string;
}

// ─── WebSocket Message Types ──────────────────────────────────────────────────

export interface WSSubscribeMessage {
  type: "subscribe";
  assignmentId: string;
}

export interface WSStatusUpdateMessage {
  type: "status_update";
  assignmentId: string;
  status: AssignmentStatus;
  data?: GeneratedPaper;
  error?: string;
}

export type WSMessage = WSSubscribeMessage | WSStatusUpdateMessage;

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateAssignmentResponse {
  assignmentId: string;
  status: AssignmentStatus;
}
