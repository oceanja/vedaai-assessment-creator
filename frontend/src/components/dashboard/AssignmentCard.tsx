"use client";

import Link from "next/link";
import { MoreVertical, Eye, Trash2, BookOpen, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import type { Assignment } from "@/types";

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<Assignment["status"], { label: string; dot: string; bg: string; text: string }> = {
  pending:    { label: "Pending",      dot: "bg-gray-400",   bg: "bg-gray-50",    text: "text-gray-600" },
  queued:     { label: "Queued",       dot: "bg-blue-400",   bg: "bg-blue-50",    text: "text-blue-600" },
  processing: { label: "Generating…",  dot: "bg-amber-400",  bg: "bg-amber-50",   text: "text-amber-600" },
  done:       { label: "Ready",        dot: "bg-emerald-400",bg: "bg-emerald-50", text: "text-emerald-700" },
  error:      { label: "Failed",       dot: "bg-red-400",    bg: "bg-red-50",     text: "text-red-600" },
};

const CARD_ACCENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
];

function getAccent(id: string) {
  const sum = id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return CARD_ACCENTS[sum % CARD_ACCENTS.length];
}

export default function AssignmentCard({ assignment, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const status = STATUS_CONFIG[assignment.status];
  const accent = getAccent(assignment._id);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group">
      {/* Coloured top stripe */}
      <div className={clsx("h-1.5 w-full bg-gradient-to-r", accent)} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={clsx("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", accent)}>
              <BookOpen size={14} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
              {assignment.title}
            </h3>
          </div>

          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 bg-white border border-gray-100 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
                <Link
                  href={`/assignments/${assignment._id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <Eye size={14} className="text-gray-400" />
                  View Assignment
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(assignment._id); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subject + Class */}
        <p className="text-xs text-gray-400 ml-10 mb-3">
          {assignment.subject} · Class {assignment.className}
        </p>

        {/* Status */}
        <div className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4", status.bg, status.text)}>
          <span className={clsx("w-1.5 h-1.5 rounded-full", status.dot, assignment.status === "processing" && "animate-pulse")} />
          {status.label}
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={11} />
            <span>Assigned <span className="text-gray-600 font-medium">{assignment.assignedDate}</span></span>
          </div>
          <span className="text-xs text-gray-400">
            Due <span className="text-gray-600 font-medium">{assignment.dueDate}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
