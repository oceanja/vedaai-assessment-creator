import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type {
  Assignment,
  AssignmentFormData,
  AssignmentStatus,
  GeneratedPaper,
  QuestionTypeRow,
  QuestionTypeOption,
} from "@/types";

// ─── Default form state ───────────────────────────────────────────────────────

const defaultFormData: AssignmentFormData = {
  title: "",
  subject: "",
  className: "",
  schoolName: "Delhi Public School",
  dueDate: "",
  timeAllowed: "3 hours",
  questionTypes: [
    { id: uuidv4(), type: "Multiple Choice Questions", count: 4, marks: 1 },
    { id: uuidv4(), type: "Short Questions", count: 3, marks: 2 },
  ],
  additionalInstructions: "",
  uploadedFile: null,
};

// ─── Store interface ──────────────────────────────────────────────────────────

interface AssignmentStore {
  // Assignments list
  assignments: Assignment[];
  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignmentStatus: (
    id: string,
    status: AssignmentStatus,
    paper?: GeneratedPaper
  ) => void;
  removeAssignment: (id: string) => void;

  // Form state
  formData: AssignmentFormData;
  setFormField: <K extends keyof AssignmentFormData>(
    field: K,
    value: AssignmentFormData[K]
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (
    id: string,
    field: keyof Omit<QuestionTypeRow, "id">,
    value: QuestionTypeRow[keyof Omit<QuestionTypeRow, "id">]
  ) => void;
  resetForm: () => void;

  // Generation state
  generationStatus: AssignmentStatus;
  generationError: string | null;
  currentAssignmentId: string | null;
  setGenerationStatus: (status: AssignmentStatus) => void;
  setGenerationError: (error: string | null) => void;
  setCurrentAssignmentId: (id: string | null) => void;

  // Computed
  totalQuestions: () => number;
  totalMarks: () => number;
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      // ── Assignments list ──────────────────────────────────────────────────
      assignments: [],

      setAssignments: (assignments) => set({ assignments }),

      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [assignment, ...state.assignments],
        })),

      updateAssignmentStatus: (id, status, paper) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id
              ? { ...a, status, ...(paper ? { generatedPaper: paper } : {}) }
              : a
          ),
        })),

      removeAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a._id !== id),
        })),

      // ── Form state ────────────────────────────────────────────────────────
      formData: { ...defaultFormData },

      setFormField: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      addQuestionType: () =>
        set((state) => {
          const usedTypes = new Set(
            state.formData.questionTypes.map((q) => q.type)
          );
          const allTypes: QuestionTypeOption[] = [
            "Multiple Choice Questions",
            "Short Questions",
            "Long Questions",
            "Diagram/Graph-Based Questions",
            "Numerical Problems",
            "True/False",
            "Fill in the Blanks",
            "Essay Questions",
          ];
          const nextType =
            allTypes.find((t) => !usedTypes.has(t)) || "Short Questions";

          return {
            formData: {
              ...state.formData,
              questionTypes: [
                ...state.formData.questionTypes,
                { id: uuidv4(), type: nextType, count: 5, marks: 5 },
              ],
            },
          };
        }),

      removeQuestionType: (id) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter(
              (q) => q.id !== id
            ),
          },
        })),

      updateQuestionType: (id, field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.map((q) =>
              q.id === id ? { ...q, [field]: value } : q
            ),
          },
        })),

      resetForm: () =>
        set({
          formData: {
            ...defaultFormData,
            questionTypes: [
              { id: uuidv4(), type: "Multiple Choice Questions", count: 4, marks: 1 },
              { id: uuidv4(), type: "Short Questions", count: 3, marks: 2 },
            ],
          },
        }),

      // ── Generation state ──────────────────────────────────────────────────
      generationStatus: "pending",
      generationError: null,
      currentAssignmentId: null,

      setGenerationStatus: (status) => set({ generationStatus: status }),
      setGenerationError: (error) => set({ generationError: error }),
      setCurrentAssignmentId: (id) => set({ currentAssignmentId: id }),

      // ── Computed ──────────────────────────────────────────────────────────
      totalQuestions: () =>
        get().formData.questionTypes.reduce((sum, q) => sum + q.count, 0),

      totalMarks: () =>
        get().formData.questionTypes.reduce(
          (sum, q) => sum + q.count * q.marks,
          0
        ),
    }),
    { name: "assignment-store" }
  )
);
