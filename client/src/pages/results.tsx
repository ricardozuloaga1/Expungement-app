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
import { DocumentGenerator } from "@/components/document-generator";

import { CheckCircle, Clock, FileText, Star, Download, ArrowLeft, LogOut, AlertCircle, ArrowRight, RotateCcw, BookOpen, Shield } from "lucide-react";
import { Link } from "wouter";
import type { EligibilityResult, QuestionnaireResponse, User } from "@shared/schema";

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

  const { data: result } = useQuery<EligibilityResult>({
    queryKey: [`/api/eligibility/${resultId}`],
    enabled: !!user && !!resultId,
  });

  const { data: questionnaireResponses = [] } = useQuery<QuestionnaireResponse[]>({
    queryKey: ["/api/questionnaire/user"],
    enabled: !!user,
  });

  // Find the questionnaire response for this result
  const questionnaireResponse = result ? questionnaireResponses.find((q: QuestionnaireResponse) => 
    q.id === result.questionnaireResponseId
  ) : undefined;

  const handleDownloadReport = () => {
    if (!result || !user) return;
    
    try {
      generatePDFReport(result, user as User, questionnaireResponse);
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

  if (!result) {
    return (
      <div className="min-h-screen homepage-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 relative z-10">
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
    <div className="min-h-screen homepage-background">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] relative z-10">
        <div className="w-full px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <span className="text-xl font-semibold text-[#111827]">Assessment Results</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-32" />
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-[#6B7280] hover:text-[#111827]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12 relative z-10">
        {/* Status Banner */}
        <div className={`rounded-lg p-6 mb-8 ${
          eligibilityDetails.noConvictionCase ? 'bg-green-50 border border-green-200' :
          eligibilityDetails.otherStateCase ? 'bg-blue-50 border border-blue-200' :
          eligibilityDetails.unsureStateCase ? 'bg-yellow-50 border border-yellow-200' :
          eligibilityDetails.unsureConvictionCase ? 'bg-yellow-50 border border-yellow-200' :
          result.automaticExpungement ? 'bg-green-50 border border-green-200' : 
          result.automaticSealing ? 'bg-blue-50 border border-blue-200' :
          result.petitionBasedSealing ? 'bg-yellow-50 border border-yellow-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {eligibilityDetails.noConvictionCase ? (
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            ) : eligibilityDetails.otherStateCase ? (
              <AlertCircle className="w-8 h-8 text-blue-600 mr-4" />
            ) : eligibilityDetails.unsureStateCase ? (
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-4" />
            ) : eligibilityDetails.unsureConvictionCase ? (
              <AlertCircle className="w-8 h-8 text-yellow-600 mr-4" />
            ) : result.automaticExpungement ? (
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
            ) : result.automaticSealing ? (
              <Shield className="w-8 h-8 text-blue-600 mr-4" />
            ) : result.petitionBasedSealing ? (
              <FileText className="w-8 h-8 text-yellow-600 mr-4" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600 mr-4" />
            )}
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {eligibilityDetails.noConvictionCase ? 'No Marijuana Conviction Found' :
                 eligibilityDetails.otherStateCase ? 'Out-of-State Conviction Detected' :
                 eligibilityDetails.unsureStateCase ? 'Conviction State Unclear' :
                 eligibilityDetails.unsureConvictionCase ? 'Conviction Status Unclear' :
                 result.automaticExpungement ? 'Eligible for Automatic Expungement' :
                 result.automaticSealing ? 'Eligible for Automatic Sealing' :
                 result.petitionBasedSealing ? 'May Be Eligible for Petition-Based Sealing' :
                 'Not Currently Eligible'}
              </h2>
              <p className="text-gray-600">
                {eligibilityDetails.noConvictionCase ? 'Great news! Since you don\'t have a marijuana conviction, your record is already clear and no action is needed.' :
                 eligibilityDetails.otherStateCase ? 'New York expungement laws don\'t apply to out-of-state convictions, but you may have options in your conviction state.' :
                 eligibilityDetails.unsureStateCase ? 'We need to determine which state issued your conviction to provide accurate guidance.' :
                 eligibilityDetails.unsureConvictionCase ? 'We need to verify your conviction status to provide accurate expungement guidance.' :
                 result.automaticExpungement ? 'Your records should be automatically expunged by the state.' :
                 result.automaticSealing ? 'Your records should be automatically sealed by the state.' :
                 result.petitionBasedSealing ? 'You may be able to petition the court for record sealing.' :
                 'Based on your responses, you may not be eligible for record relief at this time.'}
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Report */}
        <Card className="mb-8">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              Assessment Report
            </CardTitle>
            <Button 
              onClick={handleDownloadReport}
              className="bg-primary hover:bg-primary-dark"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Case Profile */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Case Profile</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {questionnaireResponse?.convictionState && (
                    <p><span className="font-medium">Conviction State:</span> {questionnaireResponse.convictionState === 'ny' ? 'New York' : questionnaireResponse.convictionState}</p>
                  )}
                  {questionnaireResponse?.hasMarijuanaConviction && (
                    <p><span className="font-medium">Marijuana Conviction:</span> {questionnaireResponse.hasMarijuanaConviction === 'yes' ? 'Yes' : questionnaireResponse.hasMarijuanaConviction === 'no' ? 'No' : 'Uncertain'}</p>
                  )}
                  {questionnaireResponse?.offenseTypes && Array.isArray(questionnaireResponse.offenseTypes) && questionnaireResponse.offenseTypes.length > 0 && (
                    <p><span className="font-medium">Offense Types:</span> {(questionnaireResponse.offenseTypes as string[]).join(', ')}</p>
                  )}
                  {questionnaireResponse?.convictionYear && (
                    <p><span className="font-medium">Conviction Year:</span> {questionnaireResponse.convictionYear}</p>
                  )}
                </div>
              </div>

              {/* Eligibility Analysis */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Eligibility Analysis</h4>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 mb-4">
                    {eligibilityDetails.primaryReason || 'Based on your responses, here is your eligibility status:'}
                  </p>
                  
                  {result.automaticExpungement && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                      <p className="text-green-800">
                        <strong>Automatic Expungement:</strong> Your marijuana possession conviction from before March 31, 2021, qualifies for automatic expungement under the MRTA (Marijuana Regulation and Taxation Act). No action is required on your part.
                      </p>
                    </div>
                  )}
                  
                  {result.automaticSealing && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                      <p className="text-blue-800">
                        <strong>Automatic Sealing:</strong> Your conviction qualifies for automatic sealing under New York's Clean Slate Act. Records will be sealed automatically after the required waiting period.
                      </p>
                    </div>
                  )}
                  
                  {result.petitionBasedSealing && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <p className="text-yellow-800">
                        <strong>Petition-Based Sealing:</strong> You may be eligible to petition the court for record sealing. This requires filing a formal petition and meeting specific criteria.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4">
                        <h5 className="font-medium text-gray-800">{rec.title}</h5>
                        <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                        {rec.timeline && (
                          <p className="text-blue-600 text-sm font-medium mt-1">Timeline: {rec.timeline}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="w-6 h-6 mr-3" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eligibilityDetails.noConvictionCase && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">For No Marijuana Conviction:</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>• No action required - you don't have a marijuana conviction to expunge</li>
                    <li>• Your record is already clear of marijuana-related charges</li>
                    <li>• Keep this assessment for your records</li>
                    <li>• Consider getting a background check if you want to verify your record status</li>
                  </ul>
                </div>
              )}

              {eligibilityDetails.otherStateCase && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">For Out-of-State Convictions:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Contact an attorney licensed in your conviction state</li>
                    <li>• Research that state's specific marijuana expungement laws</li>
                    <li>• Each state has different eligibility requirements and procedures</li>
                    <li>• New York laws don't apply to out-of-state convictions</li>
                  </ul>
                </div>
              )}

              {eligibilityDetails.unsureStateCase && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">To Determine Your Conviction State:</h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Request your criminal history from the FBI or relevant state</li>
                    <li>• Review any court documents or legal paperwork you have</li>
                    <li>• Contact the court where you believe you were convicted</li>
                    <li>• Retake this assessment once you know your conviction state</li>
                  </ul>
                </div>
              )}

              {eligibilityDetails.unsureConvictionCase && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">To Verify Your Conviction Status:</h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Obtain an official criminal background check</li>
                    <li>• Review personal records and legal documents</li>
                    <li>• Consider a brief consultation with a criminal defense attorney</li>
                    <li>• Retake this assessment once you verify your status</li>
                  </ul>
                </div>
              )}
              
              {result.automaticExpungement && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">For Automatic Expungement:</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>• No action required - the state will automatically expunge eligible records</li>
                    <li>• Process typically takes 6-12 months</li>
                    <li>• You'll receive notification when complete</li>
                    <li>• Consider getting a new background check after expungement</li>
                  </ul>
                </div>
              )}
              
              {result.automaticSealing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">For Automatic Sealing:</h4>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Records are automatically sealed after waiting period</li>
                    <li>• Sealed records won't appear on most background checks</li>
                    <li>• Monitor your record to ensure sealing occurs</li>
                    <li>• Consider legal assistance if issues arise</li>
                  </ul>
                </div>
              )}
              
              {result.petitionBasedSealing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">For Petition-Based Sealing:</h4>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• You must file a petition with the court</li>
                    <li>• Gather required documentation and court records</li>
                    <li>• Consider hiring an attorney for assistance</li>
                    <li>• Court filing fees may apply</li>
                  </ul>
                </div>
              )}
              
              {!eligibilityDetails.noConvictionCase && !eligibilityDetails.otherStateCase && !eligibilityDetails.unsureStateCase && !eligibilityDetails.unsureConvictionCase && !result.automaticExpungement && !result.automaticSealing && !result.petitionBasedSealing && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Status:</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• You may not currently qualify for available relief options</li>
                    <li>• Eligibility requirements may change over time</li>
                    <li>• Consider retaking the assessment periodically</li>
                    <li>• Consult with a legal professional for personalized advice</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/questionnaire" className="flex-1">
            <Button variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Assessment
            </Button>
          </Link>
          <Link href="/education" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </Link>
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
        eligibilityType={
          result.automaticExpungement ? 'automatic_expungement' :
          result.automaticSealing ? 'automatic_sealing' :
          result.petitionBasedSealing ? 'petition_sealing' :
          'not_eligible'
        }
        userComplexity={
          result.petitionBasedSealing ? 'complex' :
          result.automaticSealing ? 'moderate' :
          result.automaticExpungement ? 'simple' :
          'complex'
        }
      />
    </div>
  );
}
