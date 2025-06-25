import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Phone, FileText, CheckCircle, AlertCircle, User, Star, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

interface CaseStatus {
  subscriptionType: string;
  status: string;
  createdAt: string;
  currentStep: string;
  progress: number;
  nextAction: string;
  estimatedCompletion: string;
}

export function PremiumDashboard() {
  const { user } = useAuth();
  const { data: caseStatus, isLoading, error } = useQuery<CaseStatus>({
    queryKey: ['premium-case-status'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/premium/case-status");
      return response.json();
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-32">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
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

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-32">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
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

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <p className="text-red-800">Unable to load case status. Please contact support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!caseStatus) {
    return (
      <>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-32">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
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

        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">No premium subscription found.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <>
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
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

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Premium Legal Assistance</h1>
          <p className="text-gray-600">Track your case progress and next steps</p>
        </div>

        {/* Case Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              {caseStatus.subscriptionType === 'consultation' ? 'Attorney Consultation' : 'Full Legal Service'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      caseStatus.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className={`font-medium ${getStatusColor(caseStatus.status)}`}>
                      {caseStatus.status.charAt(0).toUpperCase() + caseStatus.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Started: {new Date(caseStatus.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Estimated completion: {caseStatus.estimatedCompletion}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{caseStatus.progress}%</span>
                  </div>
                </div>
                <Progress value={caseStatus.progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">{caseStatus.currentStep}</h3>
              <p className="text-blue-800">{caseStatus.nextAction}</p>
            </div>
            
            {caseStatus.subscriptionType === 'consultation' ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Consultation Scheduled</p>
                    <p className="text-sm text-gray-600">You'll receive a call within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-primary mr-3" />
                  <div>
                    <p className="font-medium">Document Review</p>
                    <p className="text-sm text-gray-600">Attorney will review your case details</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Case Assigned</p>
                    <p className="text-sm text-gray-600">Attorney assigned to your case</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Document Prep</p>
                    <p className="text-sm text-gray-600">Preparing legal documents</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium">Filing Guidance</p>
                    <p className="text-sm text-gray-600">Instructions being prepared</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What to Expect Next</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseStatus.subscriptionType === 'consultation' ? (
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Initial Consultation Call</h4>
                      <p className="text-sm text-gray-600">Our attorney will call you within 24 hours to discuss your case details and eligibility options.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold text-gray-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Personalized Action Plan</h4>
                      <p className="text-sm text-gray-600">Receive a detailed plan with specific steps for your situation and next actions to take.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Case Review Complete</h4>
                      <p className="text-sm text-gray-600">Your attorney has reviewed your case and is preparing your documents.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Document Preparation</h4>
                      <p className="text-sm text-gray-600">Legal documents are being prepared based on your specific case requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold text-gray-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Filing Instructions</h4>
                      <p className="text-sm text-gray-600">You'll receive step-by-step filing instructions and ongoing support.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-3">
                If you have questions about your case or need immediate assistance, don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 