import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Shield, Clock, Award, Play, Info, Lock } from "lucide-react";

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
      <section className="primary-gradient min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Clear Your New York Marijuana Record
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Check your eligibility for automatic expungement under MRTA 2021 and Clean Slate Act 2024
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
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <Shield className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">Secure & Private</p>
                </div>
                <div>
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">5 Minute Assessment</p>
                </div>
                <div>
                  <Award className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                  <p className="text-sm">Legal Accuracy</p>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Shield className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Secure & Confidential</h3>
                  <p className="text-blue-100 mb-6">
                    Your personal information is protected with enterprise-grade security. 
                    We never share your data with third parties.
                  </p>
                  <div className="grid grid-cols-1 gap-4 text-sm text-blue-100">
                    <div className="flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>GDPR Compliant</span>
                    </div>
                  </div>
                </div>
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
