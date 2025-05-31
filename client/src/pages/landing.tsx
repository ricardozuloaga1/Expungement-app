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
            
            {/* Hero Illustration */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <div className="text-center">
                  {/* Legal Justice SVG Illustration */}
                  <div className="mx-auto mb-6">
                    <svg width="200" height="160" viewBox="0 0 200 160" className="mx-auto">
                      {/* Scales of Justice */}
                      <g fill="white" opacity="0.9">
                        {/* Base */}
                        <rect x="95" y="130" width="10" height="20" />
                        <rect x="80" y="145" width="40" height="5" />
                        
                        {/* Pole */}
                        <rect x="98" y="30" width="4" height="100" />
                        
                        {/* Cross beam */}
                        <rect x="70" y="45" width="60" height="3" />
                        
                        {/* Left scale */}
                        <ellipse cx="80" cy="60" rx="15" ry="3" />
                        <line x1="80" y1="48" x2="65" y2="57" stroke="white" strokeWidth="1"/>
                        <line x1="80" y1="48" x2="95" y2="57" stroke="white" strokeWidth="1"/>
                        <ellipse cx="80" cy="65" rx="12" ry="2" opacity="0.7" />
                        
                        {/* Right scale */}
                        <ellipse cx="120" cy="60" rx="15" ry="3" />
                        <line x1="120" y1="48" x2="105" y2="57" stroke="white" strokeWidth="1"/>
                        <line x1="120" y1="48" x2="135" y2="57" stroke="white" strokeWidth="1"/>
                        <ellipse cx="120" cy="65" rx="12" ry="2" opacity="0.7" />
                        
                        {/* Documents on scales */}
                        <rect x="74" y="55" width="12" height="8" opacity="0.8" />
                        <rect x="114" y="55" width="12" height="8" opacity="0.8" />
                        
                        {/* Gavel */}
                        <g transform="translate(40, 90)">
                          <rect x="0" y="15" width="20" height="6" rx="3" />
                          <rect x="18" y="0" width="4" height="30" />
                          <circle cx="22" cy="35" r="3" />
                        </g>
                        
                        {/* Law book */}
                        <g transform="translate(140, 95)">
                          <rect x="0" y="0" width="25" height="18" rx="2" />
                          <rect x="2" y="2" width="21" height="14" fill="rgba(255,255,255,0.3)" />
                          <line x1="5" y1="6" x2="20" y2="6" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                          <line x1="5" y1="9" x2="18" y2="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                          <line x1="5" y1="12" x2="20" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
                        </g>
                      </g>
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Professional Legal Guidance</h3>
                  <p className="text-blue-100 mb-6">
                    Built with input from New York attorneys and based on current state laws. 
                    Your information is handled with complete confidentiality.
                  </p>
                  <div className="grid grid-cols-1 gap-4 text-sm text-blue-100">
                    <div className="flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Secure & Encrypted</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>Attorney Reviewed</span>
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
