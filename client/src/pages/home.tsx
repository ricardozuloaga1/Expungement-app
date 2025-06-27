import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumModal } from "@/components/premium-modal";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Play, FileText, Star, LogOut, User, BookOpen } from "lucide-react";
import type { QuestionnaireResponse, EligibilityResult } from "@shared/schema";
import type { User as UserType } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  const { data: questionnaireResponses = [] } = useQuery<QuestionnaireResponse[]>({
    queryKey: ["/api/questionnaire/user"],
    enabled: !!user,
  });

  const { data: eligibilityResults = [] } = useQuery<EligibilityResult[]>({
    queryKey: ["/api/eligibility/user"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
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

  const hasCompletedAssessment = Array.isArray(questionnaireResponses) && questionnaireResponses.some(r => r.completed);
  const latestResult = Array.isArray(eligibilityResults) ? eligibilityResults[0] : null;

  const handleContinueBasic = () => {
    setShowPremiumModal(false);
    // User is already on home page, so just close the modal
    toast({
      title: "Welcome back!",
      description: "Free tools and documents are available on this page.",
    });
  };

  return (
    <div className="min-h-screen bg-[#E6D5B8] relative">
      {/* NY Skyline Background */}
      <img 
        src="/assets/image1.png"
        alt="New York Skyline"
        className="fixed inset-0 w-full h-full object-cover object-bottom z-0 opacity-60"
        style={{ pointerEvents: 'none' }}
      />
      {/* Light overlay for readability */}
      <div className="fixed inset-0 w-full h-full z-10" style={{ background: 'rgba(255, 255, 255, 0.75)' }} />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-24 lg:h-32">
            <div className="flex items-center text-neutral-medium text-sm sm:text-base">
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="truncate max-w-[100px] sm:max-w-none">{(user as UserType)?.firstName || (user as UserType)?.email}</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-12 sm:h-20 lg:h-32" />
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm px-2 sm:px-3"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-dark mb-4 px-2">
            Welcome back, {(user as UserType)?.firstName || "there"}!
          </h1>

          <p className="text-base sm:text-lg text-neutral-medium max-w-3xl mx-auto mb-6 px-4">
            <strong>Clean Slater</strong> transforms complex New York expungement laws into a simple 3-step process: 
            <span className="text-neutral-dark font-medium"> Assess your eligibility → Get your personalized report → Take action with professional guidance.</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-neutral-medium px-4">
            <div className="flex items-center justify-start w-full sm:w-auto sm:justify-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold mr-2">1</div>
              <span>5-Min Assessment</span>
            </div>
            <div className="flex items-center justify-start w-full sm:w-auto sm:justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-2">2</div>
              <span>Instant Results</span>
            </div>
            <div className="flex items-center justify-start w-full sm:w-auto sm:justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-2">3</div>
              <span>Legal Action</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12 justify-center max-w-6xl mx-auto">
            {/* Assessment Card */}
            <Card className="bg-white shadow-lg flex-1 min-w-0 h-auto sm:h-[340px] p-4 sm:p-8 grid grid-rows-[auto_1fr_auto]">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="flex items-center justify-center text-base sm:text-lg text-center">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" />
                  Eligibility Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex items-center justify-center">
                {hasCompletedAssessment ? (
                  <div className="text-center space-y-3 sm:space-y-4">
                    <p className="text-neutral-medium text-sm sm:text-lg px-2">
                      You've completed your assessment. Want to update your information?
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-3 sm:space-y-4">
                    <p className="text-neutral-medium text-sm sm:text-lg px-2">
                      Take our 5-minute assessment to check your eligibility for marijuana record expungement.
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="p-0 pt-3 sm:pt-4">
                {hasCompletedAssessment ? (
                  <Link href="/questionnaire">
                    <Button className="w-full bg-[#E6D5B8] hover:bg-[#D4C2A0] text-[#5D4E37] font-medium">
                      Retake Assessment
                    </Button>
                  </Link>
                ) : (
                  <Link href="/questionnaire">
                    <Button className="w-full bg-[#E6D5B8] hover:bg-[#D4C2A0] text-[#5D4E37] font-medium">
                      <Play className="w-4 h-4 mr-2" />
                      Start Assessment
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Results Card */}
            <Card className="bg-white shadow-lg flex-1 min-w-0 h-auto sm:h-[340px] p-4 sm:p-8 grid grid-rows-[auto_1fr_auto]">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="flex items-center justify-center text-base sm:text-lg text-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-secondary-green" />
                  Your Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex items-center justify-center">
                {latestResult ? (
                  <div className="text-center space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <span className="text-sm sm:text-base text-neutral-medium block font-semibold">Status:</span>
                      <span className={`text-lg sm:text-xl font-bold block px-2 ${
                        latestResult.automaticExpungement ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {latestResult.automaticExpungement ? 'Eligible for Automatic Expungement' : 'Petition Required'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 sm:space-y-4">
                    <p className="text-neutral-medium text-sm sm:text-lg px-2">
                      Complete your assessment to see your eligibility results.
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="p-0 pt-3 sm:pt-4">
                {latestResult ? (
                  <Link href={`/results/${latestResult.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      View Detailed Results
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    No Results Available
                  </Button>
                )}
              </div>
            </Card>

            {/* Premium Features Card */}
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-lg flex-1 min-w-0 h-auto sm:h-[340px] p-4 sm:p-8 grid grid-rows-[auto_1fr_auto]">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="flex items-center justify-center text-base sm:text-lg text-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-orange-600" />
                  Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex items-center justify-center">
                <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-neutral-medium text-sm sm:text-lg px-2">
                    Enhanced legal assistance and priority support with professional oversight. Get attorney guidance and streamlined document preparation.
                  </p>
                </div>
              </CardContent>
              <div className="p-0 pt-3 sm:pt-4">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 text-sm w-full"
                  onClick={() => setShowPremiumModal(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </Card>
        </div>
      </div>

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onContinueBasic={handleContinueBasic}
      />
    </div>
  );
}
