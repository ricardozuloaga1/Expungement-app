import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress-bar";
import { QuestionnaireStep } from "@/components/questionnaire-step";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import type { QuestionnaireResponse } from "@shared/schema";

interface QuestionnaireData {
  // Section 1: Basic Info
  convictionState?: string;
  hasMarijuanaConviction?: string;
  offenseTypes?: string[];
  convictionMonth?: string;
  convictionYear?: string;
  knowsPenalCode?: string;
  penalCode?: string;
  
  // Section 2: MRTA Eligibility
  possessionAmount?: string;
  ageAtOffense?: string;
  receivedNotice?: string;
  
  // Section 3: Clean Slate Act
  convictionLevel?: string;
  servedTime?: string;
  releaseMonth?: string;
  releaseYear?: string;
  otherConvictions?: string;
  onSupervision?: string;
  hasExcludedOffenses?: string;
  
  // Section 4: Petition-Based Sealing
  totalConvictions?: string;
  totalFelonies?: string;
  tenYearsPassed?: string;
  sentenceCompleted?: string;
  
  // Section 5: Record Verification
  hasRecords?: string;
  wantsRapAssistance?: string;
  uploadedDocument?: string;
  
  // Legacy fields (for compatibility)
  age?: string;
  county?: string;
  chargeTypes?: string[];
  firstArrestDate?: string;
  convictionDetails?: any;
  completed?: boolean;
}

export default function Questionnaire() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 9;
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({});
  const [questionnaireId, setQuestionnaireId] = useState<number | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Load existing questionnaire data
  const { data: existingResponses = [] } = useQuery<QuestionnaireResponse[]>({
    queryKey: ["/api/questionnaire/user"],
    enabled: !!user,
  });

  useEffect(() => {
    if (existingResponses.length > 0) {
      const latest = existingResponses[0];
      setQuestionnaireId(latest.id);
      if (latest.age) setQuestionnaireData(prev => ({ ...prev, age: latest.age! }));
      if (latest.county) setQuestionnaireData(prev => ({ ...prev, county: latest.county! }));
      if (latest.chargeTypes) setQuestionnaireData(prev => ({ ...prev, chargeTypes: latest.chargeTypes as string[] }));
      if (latest.firstArrestDate) setQuestionnaireData(prev => ({ ...prev, firstArrestDate: latest.firstArrestDate! }));
    }
  }, [existingResponses]);

  // Save questionnaire mutation
  const saveQuestionnaireMutation = useMutation({
    mutationFn: async (data: Partial<QuestionnaireData>) => {
      if (questionnaireId) {
        return await apiRequest("PUT", `/api/questionnaire/${questionnaireId}`, data);
      } else {
        return await apiRequest("POST", "/api/questionnaire", data);
      }
    },
    onSuccess: async (response) => {
      const result = await response.json();
      if (!questionnaireId) {
        setQuestionnaireId(result.id);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/questionnaire/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete assessment mutation
  const completeAssessmentMutation = useMutation({
    mutationFn: async () => {
      // First save the final data
      let currentQuestionnaireId = questionnaireId;
      
      if (!currentQuestionnaireId) {
        const saveResponse = await apiRequest("POST", "/api/questionnaire", {
          ...questionnaireData,
          completed: true 
        });
        const savedData = await saveResponse.json();
        currentQuestionnaireId = savedData.id;
        setQuestionnaireId(currentQuestionnaireId);
      } else {
        await apiRequest("PUT", `/api/questionnaire/${currentQuestionnaireId}`, {
          ...questionnaireData,
          completed: true 
        });
      }
      
      // Then create eligibility result
      const response = await apiRequest("POST", "/api/eligibility", {
        questionnaireResponseId: currentQuestionnaireId,
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/eligibility/user"] });
      setLocation(`/results/${result.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to complete assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuestionnaireData = (field: string, value: any) => {
    setQuestionnaireData(prev => ({ ...prev, [field]: value }));
  };

  const getNextStep = (currentStep: number): number => {
    // Logic routing based on answers
    switch (currentStep) {
      case 1:
        // All options from step 1 should continue to step 2, not exit early
        return 2; // Continue to conviction status
        
      case 2:
        // Route based on conviction status - Fixed: "ny" not "new_york"
        if (questionnaireData.hasMarijuanaConviction === "yes" && questionnaireData.convictionState === "ny") {
          return 3; // Continue to full questionnaire for NY convictions
        } else {
          return totalSteps + 1; // Go to assessment for other cases (no conviction, other state, etc.)
        }
        
      case 3:
        return 4; // Continue to conviction timeline
        
      case 4:
        // After timeline, route based on conviction details
        if (questionnaireData.convictionYear) {
          const convictionYear = parseInt(questionnaireData.convictionYear);
          const isPre2021 = convictionYear < 2021;
          const isSimplePossession = questionnaireData.offenseTypes?.includes('possession');
          
          if (isPre2021 && isSimplePossession) {
            return 5; // Go to MRTA eligibility
          }
        }
        return 6; // Go to Clean Slate eligibility
        
      case 5:
        // After MRTA eligibility, check if they might also qualify for Clean Slate
        return 6;
        
      case 6:
        // After Clean Slate eligibility
        return 7; // Go to criminal history
        
      case 7:
        // After criminal history
        return 8; // Go to petition-based sealing
        
      case 8:
        // After petition-based sealing
        return 9; // Go to record verification
        
      default:
        return currentStep + 1;
    }
  };

  const handleNext = () => {
    // Save current step data
    saveQuestionnaireMutation.mutate(questionnaireData);
    
    const nextStep = getNextStep(currentStep);
    
    if (nextStep <= totalSteps) {
      setCurrentStep(nextStep);
    } else {
      // Complete assessment for all cases - create appropriate eligibility result
      completeAssessmentWithContext();
    }
  };

  // New function to handle assessment completion with different contexts
  const completeAssessmentWithContext = async () => {
    try {
      console.log("Starting assessment completion...", questionnaireData);
      
      // First save the questionnaire data
      let currentQuestionnaireId = questionnaireId;
      
      if (!currentQuestionnaireId) {
        console.log("Creating new questionnaire...");
        const saveResponse = await apiRequest("POST", "/api/questionnaire", {
          ...questionnaireData,
          completed: true 
        });
        
        if (!saveResponse.ok) {
          throw new Error(`Failed to save questionnaire: ${saveResponse.status}`);
        }
        
        const savedData = await saveResponse.json();
        currentQuestionnaireId = savedData.id;
        setQuestionnaireId(currentQuestionnaireId);
        console.log("Created questionnaire with ID:", currentQuestionnaireId);
      } else {
        console.log("Updating existing questionnaire:", currentQuestionnaireId);
        const updateResponse = await apiRequest("PUT", `/api/questionnaire/${currentQuestionnaireId}`, {
          ...questionnaireData,
          completed: true 
        });
        
        if (!updateResponse.ok) {
          throw new Error(`Failed to update questionnaire: ${updateResponse.status}`);
        }
      }
      
      // Determine the type of assessment based on user responses
      let assessmentType = {};
      
      if (questionnaireData.convictionState === "other") {
        assessmentType = { otherState: true };
      } else if (questionnaireData.convictionState === "not_sure") {
        assessmentType = { unsureState: true };
      } else if (questionnaireData.hasMarijuanaConviction === "no") {
        assessmentType = { noConviction: true };
      } else if (questionnaireData.hasMarijuanaConviction === "not_sure") {
        assessmentType = { unsureConviction: true };
      }
      
      console.log("Creating eligibility result with assessment type:", assessmentType);
      
      // Create eligibility result with appropriate context
      const response = await apiRequest("POST", "/api/eligibility", {
        questionnaireResponseId: currentQuestionnaireId,
        ...assessmentType
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Eligibility API error:", response.status, errorText);
        throw new Error(`Failed to create eligibility result: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Created eligibility result:", result);
      
      if (!result.id) {
        throw new Error("Eligibility result created but no ID returned");
      }
      
      // Show appropriate success message
      let toastTitle = "Assessment Complete";
      let toastDescription = "Your assessment has been completed successfully.";
      
      if (questionnaireData.convictionState === "other") {
        toastDescription = "We've analyzed your situation for out-of-state convictions.";
      } else if (questionnaireData.convictionState === "not_sure") {
        toastDescription = "We've provided guidance to help determine your jurisdiction.";
      } else if (questionnaireData.hasMarijuanaConviction === "no") {
        toastDescription = "Great news! No expungement needed since you don't have a conviction.";
      }
      
      toast({
        title: toastTitle,
        description: toastDescription,
      });
      
      // Add a small delay to ensure the result is saved before redirecting
      setTimeout(() => {
        console.log("Redirecting to results page with ID:", result.id);
        setLocation(`/results/${result.id}`);
      }, 500);
      
    } catch (error) {
      console.error("Error completing assessment:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: `Failed to complete assessment: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndExit = () => {
    saveQuestionnaireMutation.mutate(questionnaireData);
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
          <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen homepage-background">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] relative z-10">
        <div className="w-full px-8 py-4">
          <div className="flex items-center justify-center">
            <img src="/assets/clearny-logo.png" alt="ClearNY" className="h-32" />
          </div>
        </div>
      </div>

      {/* Main Content - Centered Single Column */}
      <div className="max-w-3xl mx-auto px-8 py-12 relative z-10">
        
        {/* Progress Bar */}
        <ProgressBar 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          className="mb-12"
        />

        {/* Main Card */}
        <Card 
          className="bg-white border border-[#E5E7EB]"
          style={{ 
            borderRadius: '0.75rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}
        >
          <CardContent className="p-12">
            <QuestionnaireStep
              step={currentStep}
              data={questionnaireData}
              onUpdate={updateQuestionnaireData}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#E5E7EB]">
              {/* Left side - Save & Exit */}
              <Button
                onClick={handleSaveAndExit}
                disabled={saveQuestionnaireMutation.isPending}
                variant="secondary"
                className="bg-transparent border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                style={{ 
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem'
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Exit
              </Button>
              
              {/* Right side - Previous & Continue */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  variant="secondary"
                  className={`
                    bg-transparent border border-[#E5E7EB] text-[#4F46E5] hover:bg-[#F9FAFB]
                    ${currentStep === 1 ? 'invisible' : ''}
                  `}
                  style={{ 
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={saveQuestionnaireMutation.isPending || completeAssessmentMutation.isPending}
                  className="bg-[#E6D5B8] hover:bg-[#D4C2A0] text-[#5D4E37] border-0 font-medium"
                  style={{ 
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  {currentStep === totalSteps ? "Complete Assessment" : "Continue"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
