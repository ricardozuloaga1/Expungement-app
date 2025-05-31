import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumModal } from "@/components/premium-modal";
import { generatePDFReport } from "@/lib/pdf-generator";
import { CheckCircle, Clock, FileText, Star, Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { EligibilityResult } from "@shared/schema";

export default function Results() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/results/:id");
  const resultId = params?.id ? parseInt(params.id) : null;
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

  const { data: eligibilityResults = [] } = useQuery<EligibilityResult[]>({
    queryKey: ["/api/eligibility/user"],
    enabled: !!user,
  });

  const result = eligibilityResults.find(r => r.id === resultId);

  const handleDownloadReport = () => {
    if (!result || !user) return;
    
    try {
      generatePDFReport(result, user);
      toast({
        title: "Report Downloaded",
        description: "Your eligibility report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
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

  if (!result) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-neutral-dark mb-4">Results Not Found</h1>
            <p className="text-neutral-medium mb-6">
              The eligibility results you're looking for could not be found.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary-dark">
                Return Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eligibilityDetails = result.eligibilityDetails as any || {};
  const recommendations = result.recommendations as any[] || [];

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-dark mb-4">
            {result.automaticExpungement ? "Great news!" : "Good news!"}
          </h1>
          <p className="text-xl text-neutral-medium">
            {result.automaticExpungement 
              ? "You appear to qualify for automatic marijuana record expungement in New York"
              : "You appear to qualify for marijuana record sealing through petition in New York"
            }
          </p>
        </div>

        {/* Eligibility Summary */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Your Eligibility Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">Automatic Expungement</h3>
                <div className="space-y-3">
                  {result.automaticExpungement ? (
                    <>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span>Possession charges qualify</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span>Charges before March 31, 2021</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-orange-600 mr-3" />
                        <span>Processing: 3-6 months</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-gray-300 mr-3"></div>
                      <span className="text-neutral-medium">Not applicable to your case</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-neutral-dark mb-4">Petition-Based Sealing</h3>
                <div className="space-y-3">
                  {result.petitionBasedSealing ? (
                    <>
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-primary mr-3" />
                        <span>Sale charges (petition required)</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-orange-600 mr-3" />
                        <span>Processing: 6-12 months</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-neutral-medium mr-3" />
                        <span>May require legal assistance</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-gray-300 mr-3"></div>
                      <span className="text-neutral-medium">Not applicable to your case</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div 
                  key={index}
                  className={`flex items-start p-4 rounded-lg ${
                    recommendation.type === 'automatic' ? 'bg-blue-50' :
                    recommendation.type === 'petition' ? 'bg-gray-50' :
                    recommendation.type === 'legal_help' ? 'bg-orange-50' :
                    'bg-green-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-0.5 ${
                    recommendation.type === 'automatic' ? 'bg-primary text-white' :
                    recommendation.type === 'petition' ? 'bg-neutral-medium text-white' :
                    recommendation.type === 'legal_help' ? 'bg-orange-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-dark">{recommendation.title}</h4>
                    <p className="text-neutral-medium text-sm">{recommendation.description}</p>
                    {recommendation.timeline && (
                      <p className="text-xs text-neutral-medium mt-1">Timeline: {recommendation.timeline}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Button 
            onClick={handleDownloadReport}
            className="w-full bg-primary text-white py-4 px-6 text-lg font-semibold hover:bg-primary-dark"
            size="lg"
          >
            <Download className="w-5 h-5 mr-3" />
            Download Free Report
          </Button>
          <Button 
            onClick={() => setShowPremiumModal(true)}
            className="w-full accent-gradient text-white py-4 px-6 text-lg font-semibold hover:opacity-90"
            size="lg"
          >
            <Star className="w-5 h-5 mr-3" />
            Get Premium Help
          </Button>
        </div>
      </div>

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onContinueBasic={() => {
          setShowPremiumModal(false);
          handleDownloadReport();
        }}
      />
    </div>
  );
}
