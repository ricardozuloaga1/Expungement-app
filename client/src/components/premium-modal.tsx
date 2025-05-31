import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { X, FileText, UserCheck, Phone, ClipboardCheck, Shield, CreditCard } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueBasic: () => void;
}

export function PremiumModal({ isOpen, onClose, onContinueBasic }: PremiumModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/premium/subscribe", {
        subscriptionType: "premium_help",
        price: 29900, // $299 in cents
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Welcome to Premium! You'll receive an email with next steps.",
      });
      onClose();
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
        title: "Payment Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      // In a real app, this would integrate with Stripe or another payment processor
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      subscribeMutation.mutate();
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

  const features = [
    {
      icon: FileText,
      title: "Pre-filled Legal Documents",
      description: "Petition forms filled with your information"
    },
    {
      icon: UserCheck,
      title: "Attorney Review",
      description: "Licensed NY attorney reviews your case"
    },
    {
      icon: Phone,
      title: "Phone Consultation",
      description: "30-minute call to discuss strategy"
    },
    {
      icon: ClipboardCheck,
      title: "Filing Instructions",
      description: "Step-by-step court filing guide"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-3xl font-bold text-neutral-dark">
              Premium Legal Assistance
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-auto p-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        {/* Premium Features */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-neutral-dark mb-4">What's Included:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <feature.icon className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-neutral-dark">{feature.title}</h4>
                  <p className="text-sm text-neutral-medium">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pricing */}
        <div className="primary-gradient text-white rounded-xl p-6 mb-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Limited Time Offer</h3>
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold">$299</span>
              <span className="text-lg ml-2 line-through opacity-75">$499</span>
            </div>
            <p className="text-blue-100 mt-2">Save $200 - Today Only</p>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleUpgrade}
            disabled={isProcessing || subscribeMutation.isPending}
            className="w-full bg-green-600 text-white py-4 text-lg font-semibold hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-3" />
                Get Premium Help Now
              </>
            )}
          </Button>
          <Button 
            onClick={onContinueBasic}
            variant="outline"
            className="w-full py-4 font-semibold"
          >
            Continue with Free Report
          </Button>
        </div>
        
        {/* Money Back Guarantee */}
        <div className="text-center mt-6 p-4 bg-green-50 rounded-lg">
          <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-dark font-medium">30-Day Money Back Guarantee</p>
          <p className="text-xs text-neutral-medium">
            Not satisfied? Get a full refund, no questions asked.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
