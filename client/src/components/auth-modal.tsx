import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoginMode: boolean;
  onToggleMode: () => void;
}

export function AuthModal({ isOpen, onClose, isLoginMode, onToggleMode }: AuthModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no email provided, use default login
    if (!formData.email.trim()) {
      window.location.href = "/api/login";
      return;
    }

    try {
      // Submit email to POST login endpoint
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email,
          name: formData.name.trim() 
        }),
      });

      if (response.ok) {
        // Close modal and reload page to show authenticated state
        onClose();
        window.location.reload();
      } else {
        // Fallback to GET login with email and name parameters
        const encodedEmail = encodeURIComponent(formData.email);
        const encodedName = encodeURIComponent(formData.name.trim());
        window.location.href = `/api/login?email=${encodedEmail}&name=${encodedName}`;
      }
    } catch (error) {
      console.error("Login error:", error);
      // Fallback to GET login with email and name parameters
      const encodedEmail = encodeURIComponent(formData.email);
      const encodedName = encodeURIComponent(formData.name.trim());
      window.location.href = `/api/login?email=${encodedEmail}&name=${encodedName}`;
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
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-neutral-dark">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name (e.g., Ricardo)"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-2"
                required
              />
            </div>
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
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-neutral-dark">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isLoginMode ? "Enter your password" : "Create a secure password"}
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="mt-2"
              required
            />
            {!isLoginMode && (
              <p className="text-xs text-neutral-medium mt-2">
                Password must be at least 8 characters with uppercase, lowercase, numbers, and symbols (!@#$%^&*)
              </p>
            )}
          </div>
          
          {!isLoginMode && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
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
          >
            {isLoginMode ? "Sign In" : "Create Account & Start Assessment"}
          </Button>
        </form>
        
        <div className="text-center">
          <p className="text-neutral-medium">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
            <Button
              variant="link"
              onClick={onToggleMode}
              className="text-primary hover:underline ml-1 p-0 h-auto"
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
