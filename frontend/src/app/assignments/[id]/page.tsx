"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
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

  const headerAction = (
    <button onClick={() => router.push('/assignments/create')} className="flex items-center gap-[6px] bg-transparent border-none cursor-pointer text-[#888] text-[13.5px] font-[500] p-0 hover:text-[#555] transition-colors">
      <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current fill-none stroke-[2]"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      Create New
    </button>
  );

  if (loading) {
    return (
      <AppShell headerAction={headerAction}>
        <div className="flex items-center justify-center py-32 bg-[#e0e0e0] flex-1">
          <Loader2 size={32} className="animate-spin text-brand-orange" />
        </div>
      </AppShell>
    );
  }

  if (!assignment) {
    return (
      <AppShell headerAction={headerAction}>
        <div className="text-center py-32 text-gray-500 bg-[#e0e0e0] flex-1">
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
    <AppShell headerAction={headerAction}>
      <div className="bg-[#e0e0e0] flex-1 overflow-y-auto px-[16px] py-[16px] flex flex-col gap-[12px]">
        {/* ── Action banner ─────────────────────────────────────────────── */}
        <div className="bg-[#2a2a2a] rounded-[14px] px-[26px] py-[22px] text-white max-w-4xl mx-auto w-full">
          {isPending ? (
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-white shrink-0" />
              <p className="text-[14.5px] font-[400] text-[#f0f0f0] mb-0">
                {STATUS_MESSAGES[assignment.status] || "Processing..."}
              </p>
            </div>
          ) : assignment.status === "error" ? (
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] text-[#f0f0f0] mb-0">
                Generation failed. Please try regenerating.
              </p>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="bg-transparent border border-white text-white px-4 py-2 rounded-lg ml-4 shrink-0 transition-colors hover:bg-white/10"
              >
                <RefreshCw size={14} className={`inline mr-2 ${regenerating ? "animate-spin" : ""}`} />
                Retry
              </button>
            </div>
          ) : paper ? (
            <div>
              <p className="text-[14.5px] leading-[1.55] text-[#f0f0f0] mb-[16px] font-[400]">
                Certainly, here are customized Question Paper for your{" "}
                <strong>{paper.className} {paper.subject}</strong>{" "}
                classes on the chosen topics:
              </p>
              <div className="flex items-center gap-[12px]">
                <PDFDownloadButton paper={paper} />
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="inline-flex items-center gap-[8px] bg-transparent text-[#f0f0f0] border border-[#555] rounded-[8px] px-[18px] py-[9px] text-[13px] font-[600] cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <RefreshCw size={14} className={regenerating ? "animate-spin" : ""} />
                  Regenerate
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Exam paper or loading state ────────────────────────────────── */}
        <div className="max-w-4xl w-full mx-auto">
          {isPending ? (
            <div className="bg-white rounded-[14px] p-[36px_32px] flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Loader2 size={28} className="animate-spin text-gray-500" />
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
                    className="w-2 h-2 rounded-full bg-[#1a1a1a] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : paper ? (
            <ExamPaper paper={paper} printRef={paperRef} />
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
