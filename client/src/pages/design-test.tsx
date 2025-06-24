import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Star, AlertTriangle, CheckCircle } from "lucide-react";

export default function DesignTest() {
  const [loading, setLoading] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-dark mb-4">
            Design System Test Page
          </h1>
          <p className="text-xl text-neutral-medium">
            Testing enhanced Card, Button, and Animation components
          </p>
        </div>

        {/* Card Variants Test */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Enhanced Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Default Card */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Default Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-medium">
                  This card has rounded-xl corners, shadow-md, and hover animations. 
                  Hover to see the lift effect!
                </p>
              </CardContent>
            </Card>

            {/* Highlighted Card */}
            <Card variant="highlighted">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-orange-600" />
                  Highlighted Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-medium">
                  This card uses the accent-orange border and orange background tint.
                  Perfect for featured content!
                </p>
              </CardContent>
            </Card>

            {/* Disabled Card */}
            <Card variant="disabled">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-gray-400" />
                  Disabled Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-medium">
                  This card is grayscale with reduced opacity and no hover effects.
                  Used for unavailable content.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Button Variants Test */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Enhanced Buttons</h2>
          <div className="grid md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-dark">Button Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default Button</Button>
                <Button variant="accent-orange">Accent Orange</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-dark">Loading States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading={loading} onClick={handleLoadingTest}>
                  {loading ? "Loading..." : "Test Loading"}
                </Button>
                <Button variant="accent-orange" loading={loading}>
                  Orange Loading
                </Button>
                <Button variant="outline" loading={true}>
                  Always Loading
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Animation Test */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Framer Motion Animations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Page Load Animation */}
            <Card animation="default">
              <CardHeader>
                <CardTitle>Page Load Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-medium mb-4">
                  This card has a fade-in and slide-up animation on page load.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                >
                  Reload Page to See Animation
                </Button>
              </CardContent>
            </Card>

            {/* No Animation */}
            <Card animation="none">
              <CardHeader>
                <CardTitle>No Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-medium mb-4">
                  This card has animations disabled for comparison.
                </p>
                <Button variant="ghost">Static Card</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Demo */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-dark mb-6">Interactive Demo</h2>
          <Card variant="highlighted" className="p-6">
            <div className="text-center space-y-6">
              <h3 className="text-xl font-semibold text-neutral-dark">
                Try the Enhanced Interactions
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="w-full" variant="accent-orange">
                    Hover & Click Me
                  </Button>
                </motion.div>
                <Button 
                  className="w-full" 
                  loading={loading}
                  onClick={handleLoadingTest}
                >
                  Loading Demo
                </Button>
                <Button className="w-full" variant="outline">
                  Press Animation
                </Button>
              </div>
              <p className="text-sm text-neutral-medium">
                Notice the scale animations, loading spinners, and hover effects!
              </p>
            </div>
          </Card>
        </section>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test the New Design</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-neutral-dark mb-2">Card Enhancements:</h4>
                <ul className="text-sm text-neutral-medium space-y-1">
                  <li>• Hover over cards to see lift animations</li>
                  <li>• Notice the rounded-xl corners</li>
                  <li>• Check the shadow transitions</li>
                  <li>• Compare the different variants</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-dark mb-2">Button Enhancements:</h4>
                <ul className="text-sm text-neutral-medium space-y-1">
                  <li>• Click buttons to see scale animation</li>
                  <li>• Test the new loading states</li>
                  <li>• Try the accent-orange variant</li>
                  <li>• Notice smooth transitions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
} 