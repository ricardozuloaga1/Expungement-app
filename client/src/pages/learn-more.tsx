import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Users, FileText, Scale, Mail, Phone, MapPin, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function LearnMore() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleStartAssessment = () => {
    setIsLoginMode(false);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#E6D5B8] relative flex flex-col">
      {/* Full Page Skyline Background */}
      <img 
        src="/assets/image1.png"
        alt="New York Skyline"
        className="fixed inset-0 w-full h-full object-cover object-bottom z-0 opacity-60"
        style={{ pointerEvents: 'none' }}
      />
      <div className="fixed inset-0 w-full h-full z-10" style={{ background: 'rgba(255, 255, 255, 0.4)' }} />
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-32">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="text-neutral-medium hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <img src="/assets/clean-slater-logo.png" alt="Clean Slater NY Logo" className="h-28" />
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleStartAssessment}
                className="bg-[#BFA77B] hover:bg-[#E6D5B8] text-[#5D4E37] font-medium"
              >
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 z-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-black">
            New York Expungement & Record Sealing
          </h1>
          <p className="text-xl text-black mb-8 leading-relaxed">
            Understanding your rights and opportunities under New York's evolving cannabis laws
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="relative z-20 bg-white bg-opacity-60">
        <div className="max-w-6xl mx-auto px-4 py-16">
          
          {/* Statistics Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-neutral-dark">By the Numbers</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">200,000+</div>
                  <p className="text-neutral-medium">Records automatically expunged under MRTA (2021)</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2.3M+</div>
                  <p className="text-neutral-medium">Records eligible for Clean Slate sealing (2024)</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-orange-600 mb-2">16 million</div>
                  <p className="text-neutral-medium">New Yorkers with criminal records</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Legal Background */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-neutral-dark">Legal Framework</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scale className="w-5 h-5 mr-2 text-green-600" />
                    MRTA (2021) - Marijuana Reform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-neutral-medium">
                    <li>• Automatic expungement for possession convictions</li>
                    <li>• Covers convictions before March 31, 2021</li>
                    <li>• No court filing or fees required</li>
                    <li>• Records automatically sealed by the state</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Clean Slate Act (2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-neutral-medium">
                    <li>• Automatic sealing after waiting periods</li>
                    <li>• 3 years for misdemeanors, 8 years for felonies</li>
                    <li>• Effective November 16, 2024</li>
                    <li>• Covers eligible non-violent convictions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Developments */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-neutral-dark">Recent Developments</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">November 2024: Clean Slate Implementation</h3>
                      <p className="text-neutral-medium">New York begins automatically sealing eligible criminal records, making it the second state to implement comprehensive automatic record sealing.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Ongoing Impact Assessment</h3>
                      <p className="text-neutral-medium">Studies show that record clearing significantly improves employment opportunities and reduces recidivism rates across New York communities.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">Community Outreach Programs</h3>
                      <p className="text-neutral-medium">State and local organizations are expanding awareness campaigns to help eligible individuals understand their rights and access available relief.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mb-16">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4 text-neutral-dark">Ready to Check Your Eligibility?</h3>
                <p className="text-neutral-medium mb-6">Take our free 5-minute assessment to see if your record qualifies for relief under New York law.</p>
                <Button 
                  onClick={handleStartAssessment}
                  className="bg-[#BFA77B] hover:bg-[#E6D5B8] text-[#5D4E37] font-semibold px-8 py-4 text-lg"
                  size="lg"
                >
                  Start Free Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center text-neutral-dark">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <a href="mailto:contact@cleanslaterny.com" className="text-blue-600 hover:text-blue-800">
                  contact@cleanslaterny.com
                </a>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Serving</h3>
                <p className="text-neutral-medium">All of New York State<br/>Remote consultations available</p>
              </div>
              <div className="flex flex-col items-center">
                <svg className="w-8 h-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="font-semibold mb-2">AI Legal Assistant</h3>
                <p className="text-neutral-medium">24/7 GPT-powered chat<br/>Trained on NY expungement law</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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