import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Landing() {
  return (
    <>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Georgia:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      
      <div className="min-h-screen bg-white">
        <style>{`
          .hero-section {
            font-family: 'Georgia', serif;
          }
          .body-text {
            font-family: 'Open Sans', sans-serif;
          }
          .hero-headline {
            font-family: 'Georgia', serif;
            font-size: clamp(2.5rem, 5vw, 4rem);
            line-height: 1.1;
            color: #1a2746;
            font-weight: 700;
            margin-bottom: 1rem;
          }
          .hero-subheading {
            font-family: 'Open Sans', sans-serif;
            font-size: clamp(1.1rem, 2vw, 1.25rem);
            color: #4a5568;
            margin-bottom: 2rem;
            line-height: 1.5;
          }
          .cta-button {
            background-color: #1a2746;
            color: white;
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            font-size: 1.125rem;
            padding: 1rem 2rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
          }
          .cta-button:hover {
            background-color: #2d3748;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26, 39, 70, 0.3);
          }
          .feature-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            background: #f7f9fc;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .feature-icon {
            font-size: 2rem;
            min-width: 3rem;
          }
          .feature-text {
            font-family: 'Open Sans', sans-serif;
            font-weight: 600;
            color: #1a2746;
            font-size: 1rem;
          }
          .footer {
            background-color: #1a2746;
            color: white;
            padding: 1.5rem 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-text {
            font-family: 'Open Sans', sans-serif;
            font-size: 0.95rem;
          }
          .footer-link {
            color: #e3e8f7;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
          }
          .footer-link:hover {
            color: white;
          }
          .hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0;
          }
          @media (max-width: 768px) {
            .hero-container {
              flex-direction: column !important;
              text-align: center;
            }
            .hero-content {
              order: 2;
              padding: 2rem 1rem;
            }
            .hero-image-container {
              order: 1;
              height: 300px;
            }
            .features-container {
              flex-direction: column;
              gap: 1rem;
            }
            .footer {
              flex-direction: column;
              gap: 1rem;
              text-align: center;
            }
          }
        `}</style>

        {/* Hero Section */}
        <main className="hero-section">
          <div 
            className="hero-container" 
            style={{
              display: 'flex',
              minHeight: '70vh',
              maxWidth: '1920px',
              margin: '0 auto'
            }}
          >
            {/* Left Content */}
            <div 
              className="hero-content"
              style={{
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem 3rem',
                backgroundColor: '#f7f9fc'
              }}
            >
              <h1 className="hero-headline">
                Clear Your New York Marijuana Record
              </h1>
              
              <p className="hero-subheading body-text">
                Find out if you qualify for automatic expungement in just minutes.
              </p>
              
              <Button asChild className="cta-button" style={{ width: 'fit-content', marginBottom: '3rem' }}>
                <Link href="/api/login">Start Free Assessment</Link>
              </Button>
              
              {/* Feature Cards */}
              <div 
                className="features-container"
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap'
                }}
              >
                <div className="feature-card" style={{ flex: '1', minWidth: '250px' }}>
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">Secure & Private</div>
                </div>
                
                <div className="feature-card" style={{ flex: '1', minWidth: '250px' }}>
                  <div className="feature-icon">✅</div>
                  <div className="feature-text">Legal Accuracy</div>
                </div>
              </div>
              
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '1rem'
                }}
              >
                <div className="feature-card" style={{ flex: '1', maxWidth: '300px' }}>
                  <div className="feature-icon">⏱</div>
                  <div className="feature-text">5-Minute Assessment</div>
                </div>
              </div>
            </div>
            
            {/* Right Image */}
            <div 
              className="hero-image-container"
              style={{
                flex: '1',
                background: 'linear-gradient(135deg, #e3e8f7 0%, #a8b8d8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {/* Professional consultation image */}
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop&crop=face"
                alt="Professional legal consultation"
                style={{
                  width: '400px',
                  height: '500px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              />
              
              {/* Background courthouse elements */}
              <div 
                style={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  width: '200px',
                  height: '150px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  opacity: 0.3
                }}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div 
            style={{
              maxWidth: '1920px',
              margin: '0 auto',
              padding: '0 3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <div className="footer-text">
              Your privacy is our top priority. We never share your data.
            </div>
            
            <a href="#" className="footer-link">
              Visit our FAQ
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}