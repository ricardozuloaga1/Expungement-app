interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-neutral-medium">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressPercent)}% Complete</span>
      </div>
    </div>
  );
}
