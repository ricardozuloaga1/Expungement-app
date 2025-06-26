import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { PremiumDashboard } from "@/components/premium-dashboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Premium() {
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'cancelled' | 'error' | null>(null);

  // Get URL parameters manually since we're using Wouter
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const cancelled = urlParams.get('canceled');
  const sessionId = urlParams.get('session_id');

  const confirmPaymentMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", "/api/premium/confirm-payment", {
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPaymentStatus('success');
      toast({
        title: "🎉 Payment Successful!",
        description: data.nextSteps || "Your premium subscription has been activated.",
      });
    },
    onError: (error) => {
      setPaymentStatus('error');
      toast({
        title: "Payment Confirmation Failed",
        description: "There was an issue confirming your payment. Please contact support.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (success === 'true' && sessionId) {
      setPaymentStatus('processing');
      confirmPaymentMutation.mutate(sessionId);
    } else if (cancelled === 'true') {
      setPaymentStatus('cancelled');
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [success, cancelled, sessionId]);

  // Show payment status if we're handling a Stripe redirect
  if (paymentStatus) {
    return (
      <div className="premium-background min-h-screen flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full">
          <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {paymentStatus === 'processing' && (
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              )}
              {paymentStatus === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {paymentStatus === 'cancelled' && (
                <XCircle className="w-16 h-16 text-yellow-500" />
              )}
              {paymentStatus === 'error' && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl">
              {paymentStatus === 'processing' && 'Processing Your Payment...'}
              {paymentStatus === 'success' && 'Payment Successful!'}
              {paymentStatus === 'cancelled' && 'Payment Cancelled'}
              {paymentStatus === 'error' && 'Payment Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4 sm:space-y-6">
            {paymentStatus === 'processing' && (
              <p className="text-gray-600 text-sm sm:text-base">
                Please wait while we confirm your payment with Stripe...
              </p>
            )}
            {paymentStatus === 'success' && (
              <>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your premium subscription has been activated successfully. You'll receive a confirmation email with next steps.
                </p>
                <Button 
                  onClick={() => setPaymentStatus(null)}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                >
                  Continue to Premium Dashboard
                </Button>
              </>
            )}
            {paymentStatus === 'cancelled' && (
              <>
                <p className="text-gray-600 text-sm sm:text-base">
                  Your payment was cancelled. No charges were made to your account.
                </p>
                <Button 
                  onClick={() => setPaymentStatus(null)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Return to Premium Options
                </Button>
              </>
            )}
            {paymentStatus === 'error' && (
              <>
                <p className="text-gray-600 text-sm sm:text-base">
                  There was an issue processing your payment. Please contact our support team.
                </p>
                <Button 
                  onClick={() => setPaymentStatus(null)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-background min-h-screen">
      <div className="relative z-10">
        <PremiumDashboard />
      </div>
    </div>
  );
} 