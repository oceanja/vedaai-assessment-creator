interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-6">
      <div
        className="h-full bg-brand-orange rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
