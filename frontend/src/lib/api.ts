import axios from "axios";
import type {
  Assignment,
  AssignmentFormData,
  ApiResponse,
  CreateAssignmentResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ─── Assignments ──────────────────────────────────────────────────────────────

export async function createAssignment(
  formData: AssignmentFormData
): Promise<CreateAssignmentResponse> {
  const payload = new FormData();

  // Append file if present
  if (formData.uploadedFile) {
    payload.append("file", formData.uploadedFile);
  }

  // Append other fields
  payload.append("title", formData.title);
  payload.append("subject", formData.subject);
  payload.append("className", formData.className);
  payload.append("schoolName", formData.schoolName);
  payload.append("dueDate", formData.dueDate);
  payload.append("timeAllowed", formData.timeAllowed);
  payload.append("questionTypes", JSON.stringify(formData.questionTypes));
  payload.append("additionalInstructions", formData.additionalInstructions);

  const res = await axios.post<ApiResponse<CreateAssignmentResponse>>(
    `${API_URL}/api/assignments`,
    payload,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error || "Failed to create assignment");
  }

  return res.data.data;
}

export async function getAssignments(): Promise<Assignment[]> {
  const res = await api.get<ApiResponse<Assignment[]>>("/assignments");
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error || "Failed to fetch assignments");
  }
  return res.data.data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const res = await api.get<ApiResponse<Assignment>>(`/assignments/${id}`);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error || "Failed to fetch assignment");
  }
  return res.data.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<null>>(`/assignments/${id}`);
  if (!res.data.success) {
    throw new Error(res.data.error || "Failed to delete assignment");
  }
}

export async function regenerateAssignment(id: string): Promise<void> {
  const res = await api.post<ApiResponse<null>>(`/assignments/${id}/regenerate`);
  if (!res.data.success) {
    throw new Error(res.data.error || "Failed to regenerate assignment");
  }
}
