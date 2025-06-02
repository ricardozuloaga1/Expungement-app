import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Clock, FileText, Users } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">NY Expungement Helper</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/api/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Clear Your New York</span>
              <span className="block text-primary">Marijuana Record</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Find out if you qualify for automatic expungement in just minutes. Our expert system analyzes your eligibility under New York's latest marijuana laws.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Button asChild size="lg" className="w-full">
                  <Link href="/api/login">Start Free Assessment</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to clear your record
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                      <Shield className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure & Private</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Your information is protected with enterprise-grade security. We never share your data.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-secondary-green text-white">
                      <CheckCircle className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Legal Accuracy</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Built by legal experts, our system analyzes the latest New York marijuana expungement laws.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                      <Clock className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">5-Minute Assessment</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Get immediate results with our streamlined questionnaire designed for speed and accuracy.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Process</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How it works
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mx-auto">
                    1
                  </div>
                  <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Answer Questions</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Complete our simple questionnaire about your marijuana-related conviction.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mx-auto">
                    2
                  </div>
                  <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Get Analysis</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our system analyzes your eligibility under current New York laws.
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mx-auto">
                    3
                  </div>
                  <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Take Action</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Receive detailed instructions and next steps for clearing your record.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to clear your record?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-light">
              Join thousands of New Yorkers who have successfully navigated the expungement process.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/api/login">Start Your Assessment Today</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 NY Expungement Helper. Your privacy is our top priority.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}