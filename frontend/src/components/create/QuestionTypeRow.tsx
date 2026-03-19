"use client";

import { QUESTION_TYPE_OPTIONS, type QuestionTypeOption } from "@/types";
import type { QuestionTypeRow as QTRow } from "@/types";

interface QuestionTypeRowProps {
  row: QTRow;
  onUpdate: (id: string, field: keyof Omit<QTRow, "id">, value: QTRow[keyof Omit<QTRow, "id">]) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function Counter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0 border border-[#e0e0e0] rounded-[8px] overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="w-[28px] h-[36px] bg-transparent border-none cursor-pointer text-[16px] text-[#555] flex items-center justify-center hover:bg-[#f5f5f5]"
      >
        −
      </button>
      <div className="flex-1 text-center text-[13px] font-[500] text-[#1a1a1a] border-l border-r border-[#e8e8e8] h-[36px] leading-[36px] min-w-[30px]">
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-[28px] h-[36px] bg-transparent border-none cursor-pointer text-[16px] text-[#555] flex items-center justify-center hover:bg-[#f5f5f5]"
      >
        +
      </button>
    </div>
  );
}

export default function QuestionTypeRow({ row, onUpdate, onRemove, canRemove }: QuestionTypeRowProps) {
  return (
    <div className="grid gap-[8px] items-center mb-[8px]" style={{ gridTemplateColumns: "1fr 130px 90px" }}>
      <div className="flex items-center gap-[6px]">
        <div className="flex flex-1 items-center border border-[#e0e0e0] rounded-[8px] py-[9px] px-[12px] bg-white gap-[6px]">
          <select
            value={row.type}
            onChange={(e) => onUpdate(row.id, "type", e.target.value as QuestionTypeOption)}
            className="flex-1 border-none outline-none text-[13px] text-[#333] bg-transparent appearance-none cursor-pointer"
          >
            {QUESTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="shrink-0 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-[#888] fill-none stroke-[2]"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(row.id)}
          disabled={!canRemove}
          className="bg-transparent border-none cursor-pointer px-[4px] flex items-center disabled:opacity-30 disabled:cursor-not-allowed hover:text-red-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[14px] h-[14px] stroke-current fill-none stroke-[2.5]"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <Counter value={row.count} onChange={(v) => onUpdate(row.id, "count", v)} />
      <Counter value={row.marks} onChange={(v) => onUpdate(row.id, "marks", v)} />
    </div>
  );
}
