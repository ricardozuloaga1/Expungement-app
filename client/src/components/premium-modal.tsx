import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { redirectToCheckout, type StripeProductType } from "@/lib/stripe";
import { X, FileText, UserCheck, Phone, ClipboardCheck, Shield, CreditCard, Calendar, CheckCircle, Star, Clock, Users, Award } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueBasic: () => void;
  eligibilityType?: string;
  userComplexity?: 'simple' | 'moderate' | 'complex';
}

export function PremiumModal({ isOpen, onClose, onContinueBasic, eligibilityType, userComplexity = 'moderate' }: PremiumModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<StripeProductType>('consultation');

  const createCheckoutMutation = useMutation({
    mutationFn: async (productType: StripeProductType) => {
      const response = await apiRequest("POST", "/api/premium/create-checkout-session", {
        productType,
        eligibilityType,
        userComplexity,
      });
      return response.json();
    },
    onSuccess: async (data) => {
      try {
        await redirectToCheckout(data.sessionId);
      } catch (error) {
        console.error('Stripe checkout error:', error);
        toast({
          title: "Payment Processing Error",
          description: "Unable to redirect to payment. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue with premium services.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Processing Error",
        description: "Unable to create payment session. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      createCheckoutMutation.mutate(selectedPlan);
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const consultationFeatures = [
    {
      icon: Phone,
      title: "30-Minute Attorney Consultation",
      description: "Licensed NY attorney reviews your case and eligibility"
    },
    {
      icon: ClipboardCheck,
      title: "Personalized Action Plan",
      description: "Custom roadmap with specific next steps for your situation"
    },
    {
      icon: FileText,
      title: "Document Review",
      description: "Attorney reviews your court documents and records"
    },
    {
      icon: Calendar,
      title: "Timeline & Strategy",
      description: "Clear timeline for when you can file and what to expect"
    }
  ];

  const fullServiceFeatures = [
    {
      icon: UserCheck,
      title: "Complete Document Preparation",
      description: "Professionally prepared petitions and legal documents"
    },
    {
      icon: FileText,
      title: "Comprehensive Case Review",
      description: "Detailed analysis of your case and legal strategy"
    },
    {
      icon: Phone,
      title: "Ongoing Legal Support",
      description: "Direct attorney access for questions and guidance"
    },
    {
      icon: ClipboardCheck,
      title: "Filing Instructions & Guidance",
      description: "Step-by-step instructions for court submission"
    },
    {
      icon: Calendar,
      title: "Case Management",
      description: "Track progress and receive updates on your case"
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "Professional-grade documents or your money back"
    }
  ];

  const getComplexityMessage = () => {
    switch (userComplexity) {
      case 'complex':
        return "⚠️ Your case appears complex - professional guidance is highly recommended";
      case 'simple':
        return "✅ Your case looks straightforward - consultation may be sufficient";
      default:
        return "📋 Professional review recommended for your situation";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-dark mb-1 sm:mb-2">
              Premium Legal Assistance
            </DialogTitle>
            <p className="text-sm sm:text-base text-neutral-medium">{getComplexityMessage()}</p>
          </div>
        </DialogHeader>

        {/* Social Proof */}
        <div className="bg-blue-50 rounded-lg p-2 sm:p-3 lg:p-4 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-xs sm:text-sm text-blue-800">
            <div className="flex items-center">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span>500+ Cases Handled</span>
            </div>
            <div className="flex items-center">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span>4.9/5 Client Rating</span>
            </div>
            <div className="flex items-center">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span>Licensed NY Attorneys</span>
            </div>
          </div>
        </div>
        
        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          {/* Consultation Plan */}
          <div 
            className={`border-2 rounded-xl p-3 sm:p-4 lg:p-6 cursor-pointer transition-all ${
              selectedPlan === 'consultation' 
                ? 'border-primary bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan('consultation')}
          >
            <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mr-2 sm:mr-3 ${
                selectedPlan === 'consultation' 
                  ? 'bg-primary border-primary' 
                  : 'border-gray-300'
              }`}>
                {selectedPlan === 'consultation' && (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-neutral-dark">Attorney Consultation</h3>
            </div>
            
            <div className="text-center mb-2 sm:mb-3 lg:mb-4">
              <div className="text-2xl sm:text-3xl font-bold text-primary">$149</div>
              <div className="text-xs sm:text-sm text-neutral-medium">One-time payment</div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {consultationFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-neutral-dark text-xs sm:text-sm">{feature.title}</h4>
                    <p className="text-xs text-neutral-medium">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 sm:mt-3 lg:mt-4 text-center">
              <span className="text-xs text-green-600 font-medium">⚡ Available within 24 hours</span>
            </div>
          </div>

          {/* Full Service Plan */}
          <div 
            className={`border-2 rounded-xl p-3 sm:p-4 lg:p-6 cursor-pointer transition-all relative ${
              selectedPlan === 'full_service' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan('full_service')}
          >
            <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                50% OFF • LIMITED TIME
              </span>
            </div>

            <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 mr-2 sm:mr-3 ${
                selectedPlan === 'full_service' 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
              }`}>
                {selectedPlan === 'full_service' && (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-neutral-dark">Full Legal Service</h3>
            </div>
            
            <div className="text-center mb-2 sm:mb-3 lg:mb-4">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-1">
                <span className="text-sm sm:text-lg text-gray-400 line-through">$600</span>
                <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold">SAVE $301</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">$299</div>
              <div className="text-xs sm:text-sm text-neutral-medium">Limited time pricing</div>
              <div className="text-xs text-green-600">Complete service • 50% off regular price</div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {fullServiceFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-neutral-dark text-xs sm:text-sm">{feature.title}</h4>
                    <p className="text-xs text-neutral-medium">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 sm:mt-3 lg:mt-4 text-center">
              <span className="text-xs text-green-600 font-medium">🏆 White-glove service</span>
            </div>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-3 sm:space-y-4">
          <Button 
            onClick={handleUpgrade}
            disabled={isProcessing || createCheckoutMutation.isPending}
            className={`w-full py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold ${
              selectedPlan === 'consultation' 
                ? 'bg-primary hover:bg-primary/90 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2 sm:mr-3"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                <span className="hidden sm:inline">Get {selectedPlan === 'consultation' ? 'Attorney Consultation' : 'Full Legal Service'} - ${selectedPlan === 'consultation' ? '149' : '299'}</span>
                <span className="sm:hidden">{selectedPlan === 'consultation' ? 'Get Consultation - $149' : 'Get Full Service - $299'}</span>
              </>
            )}
          </Button>
          
          <Button 
            onClick={onContinueBasic}
            variant="outline"
            className="w-full py-3 sm:py-4 font-semibold text-sm sm:text-base"
          >
            Continue with Free Documents & Report
          </Button>
        </div>
        
        {/* Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6">
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs font-medium">30-Day Money Back Guarantee</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs font-medium">Fast 24-48 Hour Response</p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-xs font-medium">Licensed NY Attorneys Only</p>
          </div>
        </div>

        {/* Fine Print */}
        <div className="text-xs text-neutral-medium text-center mt-3 sm:mt-4 space-y-1">
          <p>All services provided by licensed New York attorneys.</p>
          <p>Payment processed securely. No hidden fees or recurring charges.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
