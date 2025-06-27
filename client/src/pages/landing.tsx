import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Shield, Clock, Award, Play, Info, Lock } from "lucide-react";
import { Link } from "wouter";

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
    <div className="min-h-screen bg-[#E6D5B8] relative flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 md:h-24 lg:h-32">
            <div className="flex items-center">
              <button className="text-neutral-medium hover:text-primary transition-colors text-sm sm:text-base">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 inline" />
                <span className="hidden sm:inline">Help</span>
              </button>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img 
                src="/assets/clean-slater-logo.png" 
                alt="Clean Slater NY Logo" 
                className="h-12 sm:h-16 md:h-20 lg:h-28" 
              />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                onClick={handleSignIn}
                className="bg-[#BFA77B] hover:bg-[#E6D5B8] text-[#5D4E37] font-medium text-sm sm:text-base px-3 sm:px-4 py-2"
                size="sm"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center text-center min-h-[calc(100vh-4rem)]" style={{ backgroundColor: '#E6D5B8' }}>
        {/* NY Skyline Background */}
        <img 
          src="/assets/image1.png"
          alt="New York Skyline"
          className="absolute inset-0 w-full h-full object-cover object-bottom z-0 opacity-60"
          style={{ pointerEvents: 'none' }}
        />
        {/* Light overlay for readability */}
        <div className="absolute inset-0 w-full h-full z-10" style={{ background: 'rgba(255, 255, 255, 0.75)' }} />
        <div className="relative z-20 flex flex-col items-center justify-start w-full max-w-2xl px-4 pt-0 pb-12 drop-shadow-lg">
          {/* Quote Section */}
          <div className="w-full max-w-5xl mb-8 px-2">
            <blockquote className="text-sm sm:text-base md:text-lg italic text-black mb-3 leading-relaxed text-center">
              <span className="block">"Equal justice under law means that every person, regardless of their background, deserves access to the legal system and the opportunity for a fresh start."</span>
            </blockquote>
            <cite className="text-xs sm:text-sm text-black font-medium text-center block">
              — Inspired by the legacy of Thurgood Marshall
            </cite>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-black text-center px-2">
            Clear Your New York Marijuana Record
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-8 text-black leading-relaxed text-center px-2">
            Check if your conviction qualifies for automatic expungement under the MRTA (2021) and the Clean Slate Act (effective 2024). It only takes a few minutes.
          </p>
          <div className="flex flex-col gap-4 mb-12 w-full justify-center items-center max-w-md mx-auto">
            <Button 
              onClick={handleStartAssessment}
              className="bg-[#BFA77B] hover:bg-[#E6D5B8] text-black font-semibold px-8 py-4 text-lg shadow-lg w-full"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Free Assessment
            </Button>
            <Link href="/learn-more" className="w-full">
              <Button 
                variant="outline"
                className="border-2 border-[#BFA77B] text-black px-8 py-4 text-lg font-semibold hover:bg-[#E6D5B8] hover:text-black bg-transparent w-full"
                size="lg"
              >
                <Info className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>
          {/* Badges */}
          <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4">
            <img 
              src="/assets/attorney-guided-badge.png" 
              alt="Attorney-Guided NY State Bar Certified" 
              className="object-contain opacity-80 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52"
            />
            <img 
              src="/assets/human-powered-badge.png" 
              alt="Built for Humans - Legal Relief Made Radically Simple - Powered by AI" 
              className="object-contain opacity-80 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52"
            />
            <img 
              src="/assets/badge 5.png" 
              alt="One-Stop Expungement Solution - NY State Certified Legal Service" 
              className="object-contain opacity-80 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52"
            />
            <img 
              src="/assets/one-stop-expungement-badge.png" 
              alt="One-Stop Expungement Solution" 
              className="object-contain opacity-80 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-52 lg:h-52"
            />
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
