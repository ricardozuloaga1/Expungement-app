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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
      });
      // The server will redirect, but we'll also force a client-side redirect
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback - still redirect to clear the UI
      window.location.href = "/";
    }
  };

  if (isLoading) {
    return (
      <>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center h-10 sm:h-14 lg:h-20">
              {/* Left side - flex items with equal width */}
              <div className="flex items-center space-x-1 lg:space-x-3 flex-1">
                <Link href="/">
                  <Button variant="outline" size="sm" className="text-xs px-1 py-1 sm:px-2 sm:py-1">
                    <Home className="w-3 h-3" />
                    <span className="hidden sm:inline text-xs ml-1">Home</span>
                  </Button>
                </Link>
                <div className="flex items-center text-neutral-medium text-xs">
                  <User className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[60px] sm:max-w-[100px] lg:max-w-none text-xs">{(user as UserType)?.firstName || (user as UserType)?.email}</span>
                </div>
              </div>
              
              {/* Center logo - absolutely centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-6 sm:h-10 lg:h-16" />
              </div>
              
              {/* Right side - flex items with equal width to balance left side */}
              <div className="flex justify-end flex-1">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-xs px-1 py-1 sm:px-2 sm:py-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline text-xs ml-1">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex justify-center items-start relative z-10">
            <div className="w-full max-w-4xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6 mx-auto"></div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
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
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center h-12 sm:h-16 lg:h-24">
              {/* Left side - flex items with equal width */}
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-1">
                <Link href="/">
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 sm:px-3 sm:py-2">
                    <Home className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Home</span>
                  </Button>
                </Link>
                <div className="flex items-center text-neutral-medium text-xs">
                  <User className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none text-xs sm:text-sm">{(user as UserType)?.firstName || (user as UserType)?.email}</span>
                </div>
              </div>
              
              {/* Center logo - absolutely centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-8 sm:h-12 lg:h-20" />
              </div>
              
              {/* Right side - flex items with equal width to balance left side */}
              <div className="flex justify-end flex-1">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Sign Out</span>
                  <span className="sm:hidden text-xs">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex justify-center items-start relative z-10">
            <div className="w-full max-w-4xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mx-auto">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <p className="text-red-800">Unable to load case status. Please contact support.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!caseStatus) {
    return (
      <>
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center h-12 sm:h-16 lg:h-24">
              {/* Left side - flex items with equal width */}
              <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-1">
                <Link href="/">
                  <Button variant="outline" size="sm" className="text-xs px-2 py-1 sm:px-3 sm:py-2">
                    <Home className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline text-xs sm:text-sm">Home</span>
                  </Button>
                </Link>
                <div className="flex items-center text-neutral-medium text-xs">
                  <User className="w-3 h-3 mr-1" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none text-xs sm:text-sm">{(user as UserType)?.firstName || (user as UserType)?.email}</span>
                </div>
              </div>
              
              {/* Center logo - absolutely centered */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-8 sm:h-12 lg:h-20" />
              </div>
              
              {/* Right side - flex items with equal width to balance left side */}
              <div className="flex justify-end flex-1">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 sm:px-3 sm:py-2"
                >
                  <LogOut className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Sign Out</span>
                  <span className="sm:hidden text-xs">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex justify-center items-start relative z-10">
            <div className="w-full max-w-4xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600">No premium subscription found.</p>
                </CardContent>
              </Card>
            </div>
          </div>
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-12 sm:h-16 lg:h-24">
            {/* Left side - flex items with equal width */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-1">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs px-2 py-1 sm:px-3 sm:py-2">
                  <Home className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Home</span>
                </Button>
              </Link>
              <div className="flex items-center text-neutral-medium text-xs">
                <User className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[80px] sm:max-w-[120px] lg:max-w-none text-xs sm:text-sm">{(user as UserType)?.firstName || (user as UserType)?.email}</span>
              </div>
            </div>
            
            {/* Center logo - absolutely centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY" className="h-8 sm:h-12 lg:h-20" />
            </div>
            
            {/* Right side - flex items with equal width to balance left side */}
            <div className="flex justify-end flex-1">
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-xs px-2 py-1 sm:px-3 sm:py-2"
              >
                <LogOut className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline text-xs sm:text-sm">Sign Out</span>
                <span className="sm:hidden text-xs">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex justify-center items-start relative z-10">
          <div className="w-full max-w-3xl px-2 sm:px-3 lg:px-6 py-2 sm:py-4 lg:py-6 mx-auto">
            <div className="text-center mb-2 sm:mb-4 lg:mb-6">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Premium Legal Assistance</h1>
              <p className="text-xs sm:text-sm text-gray-600">Track your case progress and next steps</p>
            </div>

            {/* Case Overview */}
            <Card className="mb-2 sm:mb-3 lg:mb-4">
              <CardHeader className="pb-1 sm:pb-2 lg:pb-3 pt-2 sm:pt-3 lg:pt-4">
                <CardTitle className="flex items-center text-xs sm:text-sm lg:text-base">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1 sm:mr-2" />
                  {caseStatus.subscriptionType === 'consultation' ? 'Attorney Consultation' : 'Full Legal Service'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                <div className="grid md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                  <div>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                          caseStatus.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className={`font-medium text-xs ${getStatusColor(caseStatus.status)}`}>
                          {caseStatus.status.charAt(0).toUpperCase() + caseStatus.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        Started: {new Date(caseStatus.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Est. completion: {caseStatus.estimatedCompletion}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{caseStatus.progress}%</span>
                      </div>
                    </div>
                    <Progress value={caseStatus.progress} className="h-1 sm:h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="mb-2 sm:mb-3 lg:mb-4">
              <CardHeader className="pb-1 sm:pb-2 lg:pb-3 pt-2 sm:pt-3 lg:pt-4">
                <CardTitle className="text-xs sm:text-sm lg:text-base">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                <div className="bg-blue-50 rounded-lg p-1.5 sm:p-2 lg:p-3 mb-2 sm:mb-3">
                  <h3 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm">{caseStatus.currentStep}</h3>
                  <p className="text-blue-800 text-xs">{caseStatus.nextAction}</p>
                </div>
                
                {caseStatus.subscriptionType === 'consultation' ? (
                  <div className="grid md:grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="flex items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs">Consultation Scheduled</p>
                        <p className="text-xs text-gray-600">Call within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1.5 sm:mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs">Document Review</p>
                        <p className="text-xs text-gray-600">Case details review</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-3">
                    <div className="flex items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs">Case Assigned</p>
                        <p className="text-xs text-gray-600">Attorney assigned</p>
                      </div>
                    </div>
                    <div className="flex items-center p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs">Document Prep</p>
                        <p className="text-xs text-gray-600">Preparing documents</p>
                      </div>
                    </div>
                    <div className="flex items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs">Filing Guidance</p>
                        <p className="text-xs text-gray-600">Instructions prep</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-2 sm:mb-3 lg:mb-4">
              <CardHeader className="pb-1 sm:pb-2 lg:pb-3 pt-2 sm:pt-3 lg:pt-4">
                <CardTitle className="text-xs sm:text-sm lg:text-base">What to Expect Next</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                <div className="space-y-1.5 sm:space-y-2 lg:space-y-3">
                  {caseStatus.subscriptionType === 'consultation' ? (
                    <>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs">Initial Consultation Call</h4>
                          <p className="text-xs text-gray-600">Attorney will call within 24 hours to discuss your case.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-gray-100 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs">Personalized Action Plan</h4>
                          <p className="text-xs text-gray-600">Receive detailed plan with specific next steps.</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5">
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs">Case Review Complete</h4>
                          <p className="text-xs text-gray-600">Attorney reviewed your case and is preparing documents.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs">Document Preparation</h4>
                          <p className="text-xs text-gray-600">Legal documents being prepared for your case.</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-gray-100 rounded-full flex items-center justify-center mr-1.5 sm:mr-2 mt-0.5">
                          <span className="text-xs font-bold text-gray-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-xs">Filing Instructions</h4>
                          <p className="text-xs text-gray-600">Step-by-step filing instructions and support.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-1 sm:pb-2 lg:pb-3 pt-2 sm:pt-3 lg:pt-4">
                <CardTitle className="text-xs sm:text-sm lg:text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 lg:pb-6">
                <div className="bg-gray-50 rounded-lg p-1.5 sm:p-2 lg:p-3">
                  <p className="text-xs text-gray-600 mb-1.5 sm:mb-2">
                    Questions about your case? Don't hesitate to reach out.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                    <Button variant="outline" size="sm" className="text-xs py-1 px-2">
                      <Phone className="w-3 h-3 mr-1" />
                      Call Support
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs py-1 px-2">
                      <FileText className="w-3 h-3 mr-1" />
                      Send Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 