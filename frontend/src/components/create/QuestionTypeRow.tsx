"use client";

import { X, ChevronDown } from "lucide-react";
import { QUESTION_TYPE_OPTIONS, type QuestionTypeOption } from "@/types";
import type { QuestionTypeRow as QTRow } from "@/types";

interface QuestionTypeRowProps {
  row: QTRow;
  onUpdate: (id: string, field: keyof Omit<QTRow, "id">, value: QTRow[keyof Omit<QTRow, "id">]) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function Counter({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-300 text-lg leading-none transition-colors"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-gray-700">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-300 text-lg leading-none transition-colors"
      >
        +
      </button>
    </div>
  );
}

export default function QuestionTypeRow({
  row,
  onUpdate,
  onRemove,
  canRemove,
}: QuestionTypeRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      {/* Type dropdown */}
      <div className="flex-1 relative">
        <select
          value={row.type}
          onChange={(e) =>
            onUpdate(row.id, "type", e.target.value as QuestionTypeOption)
          }
          className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 bg-white transition-all pr-8"
        >
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>

      {/* No. of Questions */}
      <Counter
        value={row.count}
        onChange={(v) => onUpdate(row.id, "count", v)}
      />

      {/* Marks */}
      <Counter
        value={row.marks}
        onChange={(v) => onUpdate(row.id, "marks", v)}
      />

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        disabled={!canRemove}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <X size={14} />
      </button>
    </div>
  );
}
