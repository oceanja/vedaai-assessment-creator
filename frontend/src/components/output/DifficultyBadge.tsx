import { clsx } from "clsx";
import type { Difficulty } from "@/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

const STYLES: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={clsx(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border",
      STYLES[difficulty]
    )}>
      {LABELS[difficulty]}
    </span>
  );
}
