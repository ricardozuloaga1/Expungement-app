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

  const hasCompletedAssessment = questionnaireResponses.some(r => r.completed);
  const latestResult = eligibilityResults[0];

  const handleContinueBasic = () => {
    toast({
      title: "No problem!",
      description: "You can always upgrade later. Free tools are still available.",
    });
  };

  return (
    <div className="min-h-screen homepage-background">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-neutral-medium">
                <User className="w-4 h-4 mr-2" />
                <span>{(user as UserType)?.firstName || (user as UserType)?.email}</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img src="/assets/clearny-logo.png" alt="ClearNY" className="h-32" />
            </div>
            <div className="w-0"></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-dark mb-4">
            Welcome back, {(user as UserType)?.firstName || "there"}!
          </h1>
          <p className="text-xl text-neutral-medium">
            Check your marijuana record expungement eligibility
          </p>
          <p className="mt-4 text-lg text-neutral-medium max-w-2xl mx-auto">
            ClearNY helps you understand your eligibility for clearing or sealing past marijuana convictions under New York law. Our goal is to empower you with clear, step-by-step guidance and resources to take control of your record and your future.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12 justify-center max-w-4xl mx-auto">
            {/* Assessment Card */}
            <Card className="bg-white shadow-lg flex-1 min-w-0 h-[340px] p-8 grid grid-rows-[auto_1fr_auto]">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center justify-center text-lg text-center">
                  <Play className="w-6 h-6 mr-3 text-primary" />
                  Eligibility Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex items-center justify-center">
                {hasCompletedAssessment ? (
                  <div className="text-center space-y-4">
                    <p className="text-neutral-medium text-lg">
                      You've completed your assessment. Want to update your information?
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-neutral-medium text-lg">
                      Take our 5-minute assessment to check your eligibility for marijuana record expungement.
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="p-0 pt-4">
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
            <Card className="bg-white shadow-lg flex-1 min-w-0 h-[340px] p-8 grid grid-rows-[auto_1fr_auto]">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center justify-center text-lg text-center">
                  <FileText className="w-6 h-6 mr-3 text-secondary-green" />
                  Your Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex items-center justify-center">
                {latestResult ? (
                  <div className="text-center space-y-4">
                    <div className="space-y-2">
                      <span className="text-base text-neutral-medium block font-semibold">Status:</span>
                      <span className={`text-xl font-bold block ${
                        latestResult.automaticExpungement ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {latestResult.automaticExpungement ? 'Eligible for Automatic Expungement' : 'Petition Required'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-neutral-medium text-lg">
                      Complete your assessment to see your eligibility results.
                    </p>
                  </div>
                )}
              </CardContent>
              <div className="p-0 pt-4">
                {latestResult ? (
                  <Link href={`/results/${latestResult.id}`}>
                    <Button variant="outline" className="w-full">
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
        </div>

        {/* Premium Features */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 min-h-[80px] p-4 w-full">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <CardHeader className="pb-2 px-0">
                  <CardTitle className="flex items-center text-lg">
                    <Star className="w-5 h-5 mr-2 text-orange-600" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <p className="text-neutral-medium mb-2 text-sm">
                    Enhanced legal assistance and priority support for complex cases.
                  </p>
                  <ul className="text-xs text-neutral-medium space-y-1">
                    <li>• Attorney consultation referrals</li>
                    <li>• Court filing assistance</li>
                    <li>• Document preparation templates</li>
                    <li>• Priority customer support</li>
                  </ul>
                </CardContent>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 text-sm"
                  onClick={() => setShowPremiumModal(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
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
