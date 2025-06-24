import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface QuestionOption {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface QuestionnaireStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  options: QuestionOption[];
  selectedOption?: string;
  onOptionSelect: (optionId: string) => void;
  onNext: () => void;
  onBack: () => void;
  canGoBack?: boolean;
}

export function QuestionnaireDemo() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 3;

  const sampleOptions: QuestionOption[] = [
    {
      id: "beginner",
      title: "Beginner",
      icon: (
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-full bg-white/60"></div>
        </div>
      )
    },
    {
      id: "experienced",
      title: "Experienced", 
      icon: (
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-full bg-white/60 relative">
            <div className="absolute inset-0 bg-[#4F46E5] rounded-full" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0% 100%)' }}></div>
          </div>
        </div>
      )
    },
    {
      id: "professional",
      title: "Professional",
      icon: (
        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-full bg-white/60 relative">
            <div className="absolute inset-0 bg-[#4F46E5] rounded-full" style={{ clipPath: 'polygon(0 0, 75% 0, 75% 100%, 0% 100%)' }}></div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (selectedOption) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setSelectedOption(""); // Reset for next question
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setSelectedOption("");
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        backgroundColor: "#F9FAFB",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <div 
        className="w-full bg-white rounded-lg shadow-sm"
        style={{ 
          maxWidth: "768px",
          padding: "2rem",
          margin: "1rem"
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="mb-4"
            style={{
              fontSize: "1.875rem",
              fontWeight: "700",
              color: "#111827"
            }}
          >
            Question {currentStep}
          </h1>
          <p 
            style={{
              fontSize: "1rem",
              color: "#6B7280"
            }}
          >
            What is your estimate skill level?
          </p>
        </div>

        {/* Options */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {sampleOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className="cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                border: selectedOption === option.id ? "2px solid #BFA77B" : "1px solid #E5E7EB",
                backgroundColor: selectedOption === option.id ? "#E6D5B8" : "#FFFFFF",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                position: "relative"
              }}
            >
              {/* Special styling for selected Beginner option to match screenshot */}
              {option.id === "beginner" && selectedOption === option.id && (
                <div 
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                    borderRadius: "0.75rem"
                  }}
                >
                  <div className="h-full w-full flex flex-col items-center justify-center text-white relative">
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center mb-4">
                      <div className="w-8 h-8 rounded-full bg-white/60"></div>
                    </div>
                    <span 
                      style={{
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#FFFFFF"
                      }}
                    >
                      {option.title}
                    </span>
                    {/* Arrow pointer */}
                    <div 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "12px solid transparent",
                        borderRight: "12px solid transparent",
                        borderTop: "12px solid #4F46E5"
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Default card content */}
              {!(option.id === "beginner" && selectedOption === option.id) && (
                <div className="flex flex-col items-center text-center">
                  {option.icon}
                  <span 
                    style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#111827"
                    }}
                  >
                    {option.title}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={handleBack}
            disabled={currentStep === 1}
            variant="ghost"
            className="flex items-center"
            style={{
              color: "#4F46E5",
              backgroundColor: "transparent"
            }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="px-8"
            style={{
              backgroundColor: selectedOption ? "#E6D5B8" : "#E5E7EB",
              color: selectedOption ? "#5D4E37" : "#9CA3AF",
              borderRadius: "0.5rem",
              padding: "0.75rem 1.5rem",
              fontWeight: "500",
              cursor: selectedOption ? "pointer" : "not-allowed"
            }}
          >
            Next
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="text-center">
          <div 
            className="w-full mb-2 mx-auto"
            style={{
              height: "0.5rem",
              backgroundColor: "#E5E7EB",
              borderRadius: "1rem",
              overflow: "hidden",
              maxWidth: "200px"
            }}
          >
            <div 
              className="h-full transition-all duration-300"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: "#4F46E5",
                borderRadius: "1rem"
              }}
            ></div>
          </div>
          <p 
            className="text-sm font-medium tracking-wider"
            style={{
              color: "#6B7280",
              fontSize: "0.75rem",
              letterSpacing: "0.1em"
            }}
          >
            STEP {currentStep} OUT OF {totalSteps}
          </p>
          <p 
            className="text-sm mt-1"
            style={{
              color: "#4F46E5",
              fontSize: "0.875rem",
              fontWeight: "500"
            }}
          >
            {Math.round(progressPercentage)}%
          </p>
        </div>
      </div>
    </div>
  );
} 