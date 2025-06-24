interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, className = "" }: ProgressBarProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className={className}>
      <div className="flex justify-between text-sm text-[#6B7280] mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressPercent)}% Complete</span>
      </div>
      <div className="w-full bg-[#E5E7EB] rounded-full h-2">
        <div 
          className="bg-[#E6D5B8] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
