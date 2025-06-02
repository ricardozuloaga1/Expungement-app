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
      <section className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex flex-1">
          {/* Left side - Content with gradient background */}
          <div className="flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 flex items-center">
            <div className="px-4 sm:px-6 lg:px-8 py-20 w-full max-w-2xl">
              <div className="text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Clear Your New York Marijuana Record
                </h1>
                <p className="text-lg lg:text-xl mb-8 text-blue-100 leading-relaxed">
                  Check if your conviction qualifies for automatic expungement under the MRTA (2021) and the Clean Slate Act (effective 2024). It only takes a few minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button 
                    onClick={handleStartAssessment}
                    className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold hover:bg-gray-50 shadow-lg"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Free Assessment
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-blue-600 bg-transparent"
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
                    <p className="text-sm text-blue-100">Secure & Private</p>
                  </div>
                  <div>
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <p className="text-sm text-blue-100">5-Minute Assessment</p>
                  </div>
                  <div>
                    <Award className="w-8 h-8 mx-auto mb-2 text-blue-200" />
                    <p className="text-sm text-blue-100">Legal Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Professional Image */}
          <div className="hidden md:block flex-1 relative">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000&q=80"
              alt="Professional legal consultant" 
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500/40 to-transparent"></div>
          </div>
        </div>
        
        {/* Privacy Protection Bar - Full Width */}
        <div className="bg-blue-800/80 backdrop-blur-sm border-t border-blue-400/30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-center text-center">
              <Lock className="w-6 h-6 text-white mr-3 flex-shrink-0" />
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
        </div>
        
        {/* Mobile version - shows full content with background */}
        <div className="lg:hidden bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 px-4 sm:px-6 py-8">
          <div className="bg-blue-800/40 backdrop-blur-sm rounded-xl border border-blue-400/30 p-6">
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
