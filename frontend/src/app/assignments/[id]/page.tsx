"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ExamPaper from "@/components/output/ExamPaper";
import PDFDownloadButton from "@/components/output/PDFDownloadButton";
import { useAssignmentStore } from "@/store/assignmentStore";
import { getAssignment, regenerateAssignment } from "@/lib/api";
import { wsManager } from "@/lib/websocket";
import type { Assignment } from "@/types";

const STATUS_MESSAGES: Record<string, string> = {
  queued: "Your question paper is in the queue...",
  processing: "AI is generating your question paper...",
  error: "Something went wrong during generation.",
};

export default function AssignmentOutputPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { updateAssignmentStatus } = useAssignmentStore();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const fetchAssignment = useCallback(async () => {
    try {
      const data = await getAssignment(id);
      setAssignment(data);
      return data;
    } catch {
      return null;
    }
  }, [id]);

  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function init() {
      const data = await fetchAssignment();
      setLoading(false);
      if (!data) return;
      if (data.status === "done" || data.status === "error") return;

      wsManager.subscribe(id, (status, paper) => {
        setAssignment((prev) =>
          prev
            ? {
                ...prev,
                status,
                ...(paper ? { generatedPaper: paper } : {}),
              }
            : prev
        );
        updateAssignmentStatus(id, status, paper);
        if (status === "done" || status === "error") {
          wsManager.unsubscribe(id);
          if (pollInterval) clearInterval(pollInterval);
        }
      });

      pollInterval = setInterval(async () => {
        const updated = await fetchAssignment();
        if (updated?.status === "done" || updated?.status === "error") {
          clearInterval(pollInterval!);
          wsManager.unsubscribe(id);
        }
      }, 5000);
    }

    init();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      wsManager.unsubscribe(id);
    };
  }, [id, fetchAssignment, updateAssignmentStatus]);

  async function handleRegenerate() {
    if (!assignment) return;
    setRegenerating(true);
    try {
      await regenerateAssignment(id);
      setAssignment((prev) =>
        prev ? { ...prev, status: "queued", generatedPaper: undefined } : prev
      );
      wsManager.subscribe(id, (status, paper) => {
        setAssignment((prev) =>
          prev
            ? { ...prev, status, ...(paper ? { generatedPaper: paper } : {}) }
            : prev
        );
        if (status === "done" || status === "error") {
          wsManager.unsubscribe(id);
          setRegenerating(false);
        }
      });
    } catch {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumb="Assignment">
        <div className="flex items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-brand-orange" />
        </div>
      </AppShell>
    );
  }

  if (!assignment) {
    return (
      <AppShell breadcrumb="Assignment">
        <div className="text-center py-32 text-gray-500">
          Assignment not found.{" "}
          <button onClick={() => router.push("/assignments")} className="text-brand-orange underline">
            Go back
          </button>
        </div>
      </AppShell>
    );
  }

  const paper = assignment.generatedPaper;
  const isPending = assignment.status !== "done" && assignment.status !== "error";

  return (
    <AppShell breadcrumb="Create New">
      <div className="max-w-3xl mx-auto">
        {/* ── Action banner ─────────────────────────────────────────────── */}
        <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-brand-orange shrink-0" />
              <p className="text-sm font-medium">
                {STATUS_MESSAGES[assignment.status] || "Processing..."}
              </p>
            </div>
          ) : assignment.status === "error" ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-400">
                Generation failed. Please try regenerating.
              </p>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="btn-outline-orange ml-4 shrink-0"
              >
                <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                Retry
              </button>
            </div>
          ) : paper ? (
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm leading-relaxed">
                Certainly, here are customized Question Paper for your{" "}
                <span className="text-brand-orange font-semibold">{paper.subject}</span>{" "}
                classes on the curriculum:
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm border border-gray-600 px-3 py-1.5 rounded-xl hover:border-gray-400 transition-colors"
                >
                  <RefreshCw size={13} className={regenerating ? "animate-spin" : ""} />
                  Regenerate
                </button>
                <PDFDownloadButton paper={paper} />
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Exam paper or loading state ────────────────────────────────── */}
        {isPending ? (
          <div className="card flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <Loader2 size={28} className="animate-spin text-brand-orange" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              {assignment.status === "queued" ? "Waiting in queue..." : "Generating your question paper..."}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Our AI is crafting personalized questions for {assignment.subject},{" "}
              {assignment.className}. This usually takes 15–30 seconds.
            </p>
            <div className="flex gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-orange animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : paper ? (
          <ExamPaper paper={paper} printRef={paperRef} />
        ) : null}

        <div className="mt-6">
          <button
            onClick={() => router.push("/assignments")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Assignments
          </button>
        </div>
      </div>
    </AppShell>
  );
}
