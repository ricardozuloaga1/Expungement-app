import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Shield, Clock, Award, Play, Info, Lock } from "lucide-react";
import professionalAttorneyImg from "@assets/IMG_0075.png";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleStartAssessment = () => {
    setIsLoginMode(false);
    setShowAuthModal(true);
  };

  const handleSignIn = () => {
    setIsLoginMode(true);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-background-light">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary">NY Expungement Helper</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-neutral-medium hover:text-primary transition-colors">
                <Info className="w-4 h-4 mr-2 inline" />
                Help
              </button>
              <Button 
                onClick={handleSignIn}
                className="bg-primary text-white hover:bg-primary-dark"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Background with integrated image */}
        <div className="absolute inset-0 primary-gradient"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img 
            src={professionalAttorneyImg}
            alt="Professional legal consultant" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Clear Your New York Marijuana Record
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Check if your conviction qualifies for automatic expungement under the MRTA (2021) and the Clean Slate Act (effective 2024). It only takes a few minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  onClick={handleStartAssessment}
                  className="bg-white text-primary px-8 py-4 text-lg font-semibold hover:bg-gray-50"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Assessment
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-primary bg-transparent"
                  size="lg"
                >
                  <Info className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-6 text-center mb-8">
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">Secure & Private</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">5-Minute Assessment</p>
                </div>
                <div>
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">Legal Accuracy</p>
                </div>
              </div>
            </div>
            
            {/* Right side is handled by the background image */}
            <div className="hidden lg:block"></div>
          </div>
          
          {/* Privacy Protection Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mt-8">
            <div className="flex items-center justify-center text-center">
              <Lock className="w-6 h-6 text-white mr-3" />
              <div>
                <h4 className="text-lg font-semibold text-white">Your Privacy is Protected</h4>
                <p className="text-sm text-blue-100">
                  Enterprise-grade encryption with 256-bit SSL. We never share your data.
                </p>
                <p className="text-xs text-blue-200 mt-1">
                  GDPR & NY Privacy Compliant
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile Security Info */}
          <div className="lg:hidden mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="text-center">
              <Lock className="w-12 h-12 text-blue-200 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">Your Privacy is Protected</h4>
              <p className="text-sm text-blue-100 mb-4">
                Enterprise-grade security with 256-bit SSL encryption. We never share your data.
              </p>
              <div className="flex items-center justify-center text-xs text-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                <span>GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isLoginMode={isLoginMode}
        onToggleMode={() => setIsLoginMode(!isLoginMode)}
      />
    </div>
  );
}
