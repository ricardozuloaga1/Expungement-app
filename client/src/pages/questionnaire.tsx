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
  offenseType?: string;
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
      await saveQuestionnaireMutation.mutateAsync({ 
        ...questionnaireData,
        completed: true 
      });
      
      // Then create eligibility result
      const response = await apiRequest("POST", "/api/eligibility", {
        questionnaireResponseId: questionnaireId,
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

  // Determine next step based on current answers
  const getNextStep = (currentStep: number): number => {
    switch (currentStep) {
      case 1: // State question
        if (questionnaireData.convictionState === "other") {
          // End flow if not NY conviction
          return totalSteps + 1; // Exit
        }
        return 2;
      case 2: // Has conviction question
        if (questionnaireData.hasMarijuanaConviction === "no") {
          // Skip to end if no conviction
          return 9; // Go to record verification
        }
        return 3;
      default:
        return Math.min(currentStep + 1, totalSteps);
    }
  };

  // Check if current step is valid/should be shown
  const shouldShowStep = (step: number): boolean => {
    if (step === 1) return true;
    if (step === 2 && questionnaireData.convictionState === "ny") return true;
    if (step >= 3 && questionnaireData.hasMarijuanaConviction === "yes") return true;
    if (step === 9) return true; // Always show record verification
    return false;
  };

  const handleNext = () => {
    // Save current step data
    saveQuestionnaireMutation.mutate(questionnaireData);
    
    // Handle special exit conditions
    if (questionnaireData.convictionState === "other") {
      toast({
        title: "Not Supported",
        description: "We currently only support New York marijuana convictions. Please contact a local attorney for assistance with other states.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
    
    const nextStep = getNextStep(currentStep);
    
    if (nextStep <= totalSteps) {
      setCurrentStep(nextStep);
    } else {
      // Complete assessment
      completeAssessmentMutation.mutate();
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
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-dark">Eligibility Assessment</h2>
            <Button
              variant="ghost"
              onClick={handleSaveAndExit}
              disabled={saveQuestionnaireMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Exit
            </Button>
          </div>
          
          <ProgressBar 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white">
          <CardContent className="p-8">
            <QuestionnaireStep
              step={currentStep}
              data={questionnaireData}
              onUpdate={updateQuestionnaireData}
            />

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12 pt-8 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={currentStep === 1 ? "invisible" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={saveQuestionnaireMutation.isPending || completeAssessmentMutation.isPending}
                className="bg-primary hover:bg-primary-dark"
              >
                {currentStep === totalSteps ? "Complete Assessment" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
