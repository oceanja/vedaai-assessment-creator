import { clsx } from "clsx";
import type { Difficulty } from "@/types";

const LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Moderate",
  hard: "Challenging",
};

const STYLES: Record<Difficulty, string> = {
  easy: "difficulty-easy",
  medium: "difficulty-medium",
  hard: "difficulty-hard",
};

export default function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={clsx(STYLES[difficulty])}>
      {LABELS[difficulty]}
    </span>
  );
}
