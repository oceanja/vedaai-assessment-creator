import mongoose, { Schema, Document } from "mongoose";
import type { AssignmentStatus, AssignmentFormData, GeneratedPaper } from "../types";

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  assignedDate: string;
  status: AssignmentStatus;
  formData: AssignmentFormData;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeRowSchema = new Schema({
  id: String,
  type: String,
  count: Number,
  marks: Number,
}, { _id: false });

const GeneratedQuestionSchema = new Schema({
  id: Number,
  text: String,
  difficulty: { type: String, enum: ["easy", "medium", "hard"] },
  marks: Number,
}, { _id: false });

const GeneratedSectionSchema = new Schema({
  title: String,
  questionTypeName: String,
  instruction: String,
  questions: [GeneratedQuestionSchema],
}, { _id: false });

const GeneratedAnswerSchema = new Schema({
  questionId: Number,
  sectionTitle: String,
  answer: String,
}, { _id: false });

const GeneratedPaperSchema = new Schema({
  schoolName: String,
  subject: String,
  className: String,
  timeAllowed: String,
  maxMarks: Number,
  generalInstruction: String,
  sections: [GeneratedSectionSchema],
  answerKey: [GeneratedAnswerSchema],
}, { _id: false });

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    schoolName: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    assignedDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "queued", "processing", "done", "error"],
      default: "pending",
    },
    formData: {
      title: String,
      subject: String,
      className: String,
      schoolName: String,
      dueDate: String,
      timeAllowed: String,
      questionTypes: [QuestionTypeRowSchema],
      additionalInstructions: String,
      uploadedFileUrl: String,
    },
    generatedPaper: GeneratedPaperSchema,
    errorMessage: String,
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>("Assignment", AssignmentSchema);
