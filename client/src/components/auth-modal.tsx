import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginMode: boolean;
  onToggleMode: () => void;
}

export function AuthModal({ isOpen, onClose, isLoginMode, onToggleMode }: AuthModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoginMode && !formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    if (!isLoginMode && (!formData.firstName || !formData.lastName)) {
      toast({
        title: "Missing Information", 
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Invalidate auth queries to trigger re-fetch
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        
        toast({
          title: isLoginMode ? "Welcome back!" : "Account created!",
          description: data.newUser ? "Your account has been created successfully." : "You're now signed in.",
        });
        
        onClose();
        
        // Small delay to allow auth state to update
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-neutral-dark">
              {isLoginMode ? "Welcome Back" : "Create Your Account"}
            </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLoginMode && (
            <>
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-neutral-dark">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="mt-2"
                  required={!isLoginMode}
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-neutral-dark">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="mt-2"
                  required={!isLoginMode}
                />
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-neutral-dark">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="mt-2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-neutral-dark">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isLoginMode ? "Enter your password" : "Create a secure password (min 6 characters)"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="mt-2"
              required
              minLength={6}
            />
          </div>
          
          {!isLoginMode && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                required={!isLoginMode}
              />
              <Label htmlFor="terms" className="text-sm text-neutral-medium leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </Label>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-white py-3 font-semibold hover:bg-primary-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLoginMode ? "Signing In..." : "Creating Account..."}
              </>
            ) : (
              isLoginMode ? "Sign In" : "Create Account & Start Assessment"
            )}
          </Button>
        </form>
        
        <div className="text-center">
          <p className="text-neutral-medium">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <Button
              variant="link"
              onClick={onToggleMode}
              className="text-primary hover:underline ml-1 p-0 h-auto"
              disabled={isLoading}
            >
              {isLoginMode ? "Create Account" : "Sign In"}
            </Button>
          </p>
        </div>
        
        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <Lock className="text-primary mt-1 mr-3 h-4 w-4" />
            <div>
              <p className="text-sm text-neutral-dark font-medium">Your Privacy is Protected</p>
              <p className="text-xs text-neutral-medium mt-1">
                All information is encrypted and stored securely. We never share your data.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
