"use client";

import type { GeneratedPaper } from "@/types";
import DifficultyBadge from "./DifficultyBadge";
import { GraduationCap, Clock, Award } from "lucide-react";

interface ExamPaperProps {
  paper: GeneratedPaper;
  printRef?: React.RefObject<HTMLDivElement>;
}

export default function ExamPaper({ paper, printRef }: ExamPaperProps) {
  return (
    <div
      ref={printRef}
      id="exam-paper"
      className="bg-white rounded-2xl shadow-card overflow-hidden fade-in"
    >
      {/* ── Decorative header band ─────────────────────────────────────── */}
      <div className="h-2 w-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900" />

      <div className="p-6 md:p-10" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
        {/* ── School Header ────────────────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap size={20} className="text-gray-600" strokeWidth={1.5} />
          </div>
          <h1 className="text-lg md:text-xl font-bold text-gray-900">{paper.schoolName}</h1>
          <p className="text-sm md:text-base font-medium text-gray-700 mt-1">Subject: {paper.subject}</p>
          <p className="text-sm text-gray-600">Class: {paper.className}</p>
        </div>

        <div className="border-t-2 border-b border-gray-900 border-b-gray-200 mb-5 pt-1">
          <div className="flex justify-between items-center py-2 text-sm">
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock size={13} className="text-gray-500" />
              Time Allowed: {paper.timeAllowed}
            </div>
            <div className="flex items-center gap-1.5 font-semibold">
              <Award size={13} className="text-gray-500" />
              Maximum Marks: {paper.maxMarks}
            </div>
          </div>
        </div>

        {/* ── General instruction ──────────────────────────────────────── */}
        <p className="text-sm italic text-gray-600 mb-6 text-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          {paper.generalInstruction}
        </p>

        {/* ── Student info ─────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Name" },
            { label: "Roll Number" },
            { label: `Class: ${paper.className} Section` },
          ].map(({ label }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">{label}</span>
              <div className="border-b-2 border-dashed border-gray-300 h-6" />
            </div>
          ))}
        </div>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        {paper.sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-8">
            {/* Section title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-200" />
              <h2 className="text-sm md:text-base font-bold text-gray-900 px-3 py-1.5 bg-gray-900 text-white rounded-full">
                {section.title}
              </h2>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Question type + instruction */}
            <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-bold text-gray-800">{section.questionTypeName}</p>
              <p className="text-xs italic text-gray-500 mt-0.5">{section.instruction}</p>
            </div>

            {/* Questions */}
            <ol className="space-y-3 list-none">
              {section.questions.map((q) => (
                <li key={q.id} className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  {/* Number bubble */}
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-gray-200 transition-colors">
                    {q.id}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-gray-800 mb-2">{q.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <DifficultyBadge difficulty={q.difficulty} />
                      <span className="text-xs text-gray-400 font-medium">
                        [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}

        {/* ── End of paper ─────────────────────────────────────────────── */}
        <div className="text-center text-sm font-bold text-gray-600 border-t-2 border-dashed border-gray-200 pt-4 mb-8 tracking-wide uppercase text-xs">
          ✦ End of Question Paper ✦
        </div>

        {/* ── Answer Key ───────────────────────────────────────────────── */}
        {paper.answerKey.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-brand-orange rounded-full" />
              <h3 className="text-base font-bold text-gray-800">Answer Key</h3>
            </div>
            <div className="space-y-3">
              {paper.answerKey.map((ak, idx) => (
                <div key={idx} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold flex items-center justify-center shrink-0">
                    {ak.questionId}
                  </span>
                  <p className="text-gray-700 leading-relaxed flex-1">{ak.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
