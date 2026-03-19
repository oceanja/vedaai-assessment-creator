"use client";

import type { GeneratedPaper, GeneratedSection, GeneratedQuestion, Difficulty } from "@/types";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

interface ExamPaperProps {
  paper: GeneratedPaper;
  printRef?: React.RefObject<HTMLDivElement>;
}

export default function ExamPaper({ paper, printRef }: ExamPaperProps) {
  return (
    <div
      ref={printRef}
      id="exam-paper"
      className="bg-white rounded-[14px] px-[36px] py-[32px] md:px-[40px] md:py-[36px] font-sans"
    >
      {/* HEADER */}
      <h1 className="text-[20px] font-[800] text-center text-[#1a1a1a] mb-[4px]">{paper.schoolName || "Delhi Public School"}</h1>
      <div className="text-[15px] font-[600] text-center text-[#1a1a1a] mb-[2px]">Subject: {paper.subject}</div>
      <div className="text-[15px] font-[600] text-center text-[#1a1a1a] mb-[20px]">Class: {paper.className}</div>

      {/* META */}
      <div className="flex justify-between mb-[16px]">
        <span className="text-[13.5px] font-[600] text-[#1a1a1a]">Time Allowed: {paper.timeAllowed || "N/A"}</span>
        <span className="text-[13.5px] font-[600] text-[#1a1a1a]">Maximum Marks: {paper.maxMarks || "N/A"}</span>
      </div>

      <div className="text-[13.5px] font-[600] text-[#1a1a1a] mb-[18px]">
        {paper.generalInstruction || "All questions are compulsory unless stated otherwise."}
      </div>

      {/* FIELDS */}
      <div className="mb-[24px]">
        <div className="text-[13.5px] text-[#1a1a1a] mb-[6px]">
          Name: <span className="inline-block border-b-[1.5px] border-[#1a1a1a] min-w-[140px] ml-[4px] text-transparent select-none">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
        <div className="text-[13.5px] text-[#1a1a1a] mb-[6px]">
          Roll Number: <span className="inline-block border-b-[1.5px] border-[#1a1a1a] min-w-[140px] ml-[4px] text-transparent select-none">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
        <div className="text-[13.5px] text-[#1a1a1a] mb-[6px]">
          Class: {paper.className} Section: <span className="inline-block border-b-[1.5px] border-[#1a1a1a] min-w-[80px] ml-[4px] text-transparent select-none">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* SECTIONS */}
      {paper.sections.map((section: GeneratedSection, sIdx: number) => (
        <div key={sIdx} className="mb-[24px]">
          <div className="text-[15px] font-[700] text-center text-[#1a1a1a] mb-[14px]">{section.title}</div>
          <div className="text-[14px] font-[700] text-[#1a1a1a] mb-[3px]">{section.questionTypeName}</div>
          <div className="text-[12.5px] text-[#555] italic mb-[14px]">{section.instruction}</div>

          <ol className="list-none p-0 m-0 mb-[20px]">
            {section.questions.map((q: GeneratedQuestion) => (
              <li key={q.id} className="text-[13px] text-[#1a1a1a] leading-[1.6] mb-[6px] pl-[0] flex gap-[4px]">
                <span className="min-w-[22px] shrink-0 font-[400] text-[13px]">{q.id}.</span>
                <span className="flex-1">
                  [{DIFFICULTY_LABELS[q.difficulty]}] {q.text} 
                  <span className="font-[600] ml-1">[{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]</span>
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[4px] mt-[4px]">
                      {q.options.map((opt: string, oIdx: number) => (
                        <div key={oIdx} className="text-[13px] text-[#333]">
                          <span className="font-[600] inline-block w-[24px]">{String.fromCharCode(97 + oIdx)})</span>
                          {opt.replace(/^[a-d]\)\s*/i, '')}
                        </div>
                      ))}
                    </div>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div className="text-[13.5px] font-[700] text-[#1a1a1a] mb-[28px] text-center">End of Question Paper</div>

      {paper.answerKey && paper.answerKey.length > 0 && (
        <div className="mt-[32px] pt-[24px] border-t-[1.5px] border-dashed border-[#ddd]">
          <div className="text-[15px] font-[700] text-[#1a1a1a] mb-[14px]">Answer Key:</div>
          <ol className="list-none p-0 m-0">
            {paper.answerKey.map((ak, idx) => (
              <li key={idx} className="text-[13px] text-[#1a1a1a] leading-[1.65] mb-[10px] pl-[0] flex flex-row gap-[4px] items-start">
                <span className="min-w-[22px] shrink-0 text-[13px]">{ak.questionId}.</span>
                <span className="flex-1">{ak.answer}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
