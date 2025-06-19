import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Play, FileText, Star, LogOut, User, BookOpen } from "lucide-react";
import type { QuestionnaireResponse, EligibilityResult } from "@shared/schema";
import type { User as UserType } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">NY Expungement Helper</h1>
            </div>
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-dark mb-4">
            Welcome back, {(user as UserType)?.firstName || "there"}!
          </h1>
          <p className="text-xl text-neutral-medium">
            Check your marijuana record expungement eligibility
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Assessment Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-6 h-6 mr-3 text-primary" />
                Eligibility Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasCompletedAssessment ? (
                <div className="space-y-4">
                  <p className="text-neutral-medium">
                    You've completed your assessment. Want to update your information?
                  </p>
                  <Link href="/questionnaire">
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      Retake Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-neutral-medium">
                    Take our 5-minute assessment to check your eligibility for marijuana record expungement.
                  </p>
                  <Link href="/questionnaire">
                    <Button className="w-full bg-primary hover:bg-primary-dark">
                      <Play className="w-4 h-4 mr-2" />
                      Start Assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-3 text-secondary-green" />
                Your Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-medium">Status:</span>
                    <span className={`text-sm font-medium ${
                      latestResult.automaticExpungement ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {latestResult.automaticExpungement ? 'Eligible for Automatic Expungement' : 'Petition Required'}
                    </span>
                  </div>
                  <Link href={`/results/${latestResult.id}`}>
                    <Button variant="outline" className="w-full">
                      View Detailed Results
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-neutral-medium">
                    Complete your assessment to see your eligibility results.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    No Results Available
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                Legal Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-neutral-medium">
                  Learn about NY record relief laws through interactive modules and earn achievement badges.
                </p>
                <Link href="/education">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Learning
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features */}
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <Star className="w-6 h-6 mr-3" />
              Premium Legal Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Get Professional Help</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Pre-filled legal documents</li>
                  <li>• Attorney review of your case</li>
                  <li>• 30-minute phone consultation</li>
                  <li>• Step-by-step filing instructions</li>
                </ul>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-orange-800">$299</span>
                  <span className="text-lg text-orange-600 line-through ml-2">$499</span>
                </div>
                <Button className="accent-gradient text-white hover:opacity-90">
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
