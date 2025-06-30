import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionnaireResponseSchema, insertEligibilityResultSchema } from "../shared/schema";
import { z } from "zod";
import OpenAI from 'openai';

// Helper functions
function getConvictionDate(month?: string, year?: string): Date | null {
  if (!month || !year) return null;
  return new Date(parseInt(year), parseInt(month) - 1);
}

function calculateYearsSinceConviction(
  convictionMonth?: string, 
  convictionYear?: string,
  releaseMonth?: string,
  releaseYear?: string,
  servedTime?: string
): number {
  const now = new Date();
  
  // If they served time, calculate from release date
  if (servedTime === "yes" && releaseMonth && releaseYear) {
    const releaseDate = new Date(parseInt(releaseYear), parseInt(releaseMonth) - 1);
    return (now.getTime() - releaseDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  // Otherwise calculate from conviction date
  if (convictionMonth && convictionYear) {
    const convictionDate = new Date(parseInt(convictionYear), parseInt(convictionMonth) - 1);
    return (now.getTime() - convictionDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }
  
  return 0;
}

// Eligibility determination logic
function determineEligibility(responses: any) {
  // Server-side eligibility analysis using the comprehensive data structure
  const {
    convictionState,
    hasMarijuanaConviction,
    offenseTypes,
    convictionMonth,
    convictionYear,
    possessionAmount,
    ageAtOffense,
    receivedNotice,
    convictionLevel,
    servedTime,
    releaseMonth,
    releaseYear,
    otherConvictions,
    onSupervision,
    hasExcludedOffenses,
    totalConvictions,
    totalFelonies,
    tenYearsPassed,
    sentenceCompleted,
    // Legacy fields for backward compatibility
    age,
    chargeTypes,
    firstArrestDate,
  } = responses;

  // Ensure arrays are never null/undefined and provide safe defaults for other fields
  const safeOffenseTypes = Array.isArray(offenseTypes) ? offenseTypes : [];
  const safeChargeTypes = Array.isArray(chargeTypes) ? chargeTypes : [];
  
  // Provide safe defaults for other potentially null fields
  const safeTotalConvictions = totalConvictions || "0";
  const safeTotalFelonies = totalFelonies || "0";

  let automaticExpungement = false;
  let automaticSealing = false;
  let petitionBasedSealing = false;
  const eligibilityDetails: any = { primaryReason: "", secondaryReasons: [] };
  const recommendations: any[] = [];

  // Check for automatic disqualifiers first
  if (onSupervision === "yes") {
    eligibilityDetails.primaryReason = "Currently on probation or parole - must complete supervision first";
    recommendations.push({
      type: "wait",
      title: "Complete Current Supervision",
      description: "You must complete all probation or parole requirements before becoming eligible for any relief.",
      timeline: "Until supervision ends"
    });
    return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
  }

  if (hasExcludedOffenses === "yes") {
    eligibilityDetails.primaryReason = "Conviction for excluded offense (Class A felony or sex offense)";
    eligibilityDetails.excludedOffense = true;
    recommendations.push({
      type: "excluded",
      title: "Excluded Offense",
      description: "Class A felonies and sex offenses are permanently excluded from expungement and sealing.",
      timeline: "Not applicable"
    });
    return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
  }

  // Check for MRTA Automatic Expungement (Best outcome)
  if (safeOffenseTypes.includes("possession") && possessionAmount === "yes") {
    const convictionDate = getConvictionDate(convictionMonth, convictionYear);
    if (convictionDate && convictionDate < new Date('2021-03-31')) {
      automaticExpungement = true;
      eligibilityDetails.primaryReason = "Eligible for automatic expungement under MRTA 2021";
      eligibilityDetails.mrtaApplicable = true;
      
      recommendations.push({
        type: "verify",
        title: "Verify Automatic Expungement Status",
        description: "Your record should already be expunged. Contact the court clerk to confirm and obtain documentation.",
        timeline: "1-2 weeks"
      });
      return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
    }
  }

  // Check for Clean Slate Act Automatic Sealing
  const yearsPassedSince = calculateYearsSinceConviction(convictionMonth, convictionYear, releaseMonth, releaseYear, servedTime);
  
  if (convictionLevel === "misdemeanor" && yearsPassedSince >= 3 && otherConvictions === "no") {
    automaticSealing = true;
    eligibilityDetails.primaryReason = "Eligible for automatic sealing under Clean Slate Act (misdemeanor, 3+ years)";
    eligibilityDetails.cleanSlateApplicable = true;
    
    recommendations.push({
      type: "automatic_sealing",
      title: "Monitor Clean Slate Implementation",
      description: "Your record will be automatically sealed starting November 2024. No action required on your part.",
      timeline: "November 2024"
    });
    return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
  }
  
  if (convictionLevel === "felony" && yearsPassedSince >= 8 && otherConvictions === "no") {
    automaticSealing = true;
    eligibilityDetails.primaryReason = "Eligible for automatic sealing under Clean Slate Act (felony, 8+ years)";
    eligibilityDetails.cleanSlateApplicable = true;
    
    recommendations.push({
      type: "automatic_sealing",
      title: "Monitor Clean Slate Implementation", 
      description: "Your record will be automatically sealed starting November 2024. No action required on your part.",
      timeline: "November 2024"
    });
    return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
  }

  // PRIORITY 4: Check for Petition-Based Sealing (CPL § 160.59)
  // Calculate if 10 years have passed automatically
  const tenYearsHavePassed = yearsPassedSince >= 10;
  
  if (tenYearsHavePassed && 
      parseInt(safeTotalConvictions) <= 2 && 
      parseInt(safeTotalFelonies) <= 1 &&
      sentenceCompleted === "yes") {
    
    petitionBasedSealing = true;
    eligibilityDetails.primaryReason = "Eligible for petition-based sealing under CPL § 160.59";
    eligibilityDetails.petitionApplicable = true;
    eligibilityDetails.yearsSinceConviction = yearsPassedSince.toFixed(1);
    
    recommendations.push({
      type: "petition",
      title: "File Court Petition for Record Sealing",
      description: `You meet the criteria for petition-based sealing: ≤2 convictions, ≤1 felony, ${yearsPassedSince.toFixed(1)} years have passed (≥10 required), and sentence completed. This requires a formal application and court approval.`,
      timeline: "6-12 months"
    });
    
    recommendations.push({
      type: "legal_help",
      title: "Consider Legal Assistance",
      description: "Petition-based sealing has specific requirements and is discretionary. Legal help can improve your chances of success.",
      timeline: "Before filing"
    });
    return { automaticExpungement, automaticSealing, petitionBasedSealing, eligibilityDetails, recommendations };
  }

  // Not Currently Eligible
  if (convictionLevel === "misdemeanor" && yearsPassedSince < 3) {
    const yearsRemaining = 3 - yearsPassedSince;
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
  } else if (convictionLevel === "felony" && yearsPassedSince < 8) {
    const yearsRemaining = 8 - yearsPassedSince;
    eligibilityDetails.primaryReason = `Not enough time has passed for Clean Slate sealing (need ${yearsRemaining.toFixed(1)} more years)`;
  } else if (otherConvictions === "yes") {
    eligibilityDetails.primaryReason = "Additional convictions prevent automatic sealing";
  } else if (parseInt(safeTotalConvictions) > 2) {
    eligibilityDetails.primaryReason = "Too many total convictions for petition-based sealing (maximum 2)";
  } else if (!tenYearsHavePassed) {
    const yearsRemaining = 10 - yearsPassedSince;
    eligibilityDetails.primaryReason = `Need ${yearsRemaining.toFixed(1)} more years for petition-based sealing (10 years required)`;
    eligibilityDetails.yearsSinceConviction = yearsPassedSince.toFixed(1);
  } else if (sentenceCompleted !== "yes") {
    eligibilityDetails.primaryReason = "Must complete all sentence conditions before petition-based sealing";
  } else {
    eligibilityDetails.primaryReason = "Does not meet current eligibility criteria for any relief pathway";
  }

  recommendations.push({
    type: "future",
    title: "Check Eligibility Again Later",
    description: "Your eligibility may change over time as laws evolve and waiting periods are satisfied.",
    timeline: "Periodically"
  });

  // Additional recommendations
  recommendations.push({
    type: "report",
    title: "Download Your Complete Report",
    description: "Get a detailed analysis of your eligibility with legal citations and timelines.",
    timeline: "Immediate"
  });

  if (petitionBasedSealing) {
    recommendations.push({
      type: "legal_help",
      title: "Consider Professional Legal Assistance",
      description: "For complex cases requiring petitions, legal assistance may expedite the process.",
      timeline: "Varies"
    });
  }

  return {
    automaticExpungement,
    automaticSealing,
    petitionBasedSealing,
    eligibilityDetails,
    recommendations
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Use Supabase auth if available, otherwise fall back to simple auth
  let authModule: any;
  
  // Debug logging for environment
  console.log("🔍 Environment debug:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("VERCEL:", process.env.VERCEL);
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
  console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
  
  // Add timeout and error handling for auth system selection
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log("Attempting to use Supabase auth...");
      
      // Add timeout for Supabase connection test
      const supabaseTest = Promise.race([
        import("./supabaseAuth").then(async (module) => {
          // Try to validate Supabase connection
          console.log("Supabase auth module loaded successfully");
          return module;
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase connection timeout')), 5000)
        )
      ]);
      
      authModule = await supabaseTest;
      console.log("✅ Using Supabase auth");
    } else {
      throw new Error("Supabase environment variables not set");
    }
  } catch (error) {
    console.warn("⚠️ Supabase auth failed, falling back to simple auth:", error);
    try {
      authModule = await import("./simpleAuth");
      console.log("✅ Using simple auth fallback");
    } catch (simpleAuthError) {
      console.error("❌ Simple auth also failed, using emergency auth:", simpleAuthError);
      authModule = await import("./emergency-auth");
      authModule.setupAuth = authModule.setupEmergencyAuth;
      authModule.isAuthenticated = authModule.emergencyAuthMiddleware;
      console.log("🚨 Using EMERGENCY AUTH");
    }
  }
  
  const { setupAuth } = authModule;
  const isAuthenticated = authModule.isAuthenticated || ((req: any, res: any, next: any) => {
    // Simple middleware for Supabase auth - check for user ID in cookie
    const userId = req.cookies?.supabase_user_id;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    req.user = { claims: { sub: userId } };
    next();
  });

  // Auth middleware with error handling
  try {
    await setupAuth(app);
    console.log("✅ Authentication system initialized successfully");
  } catch (error) {
    console.error("❌ Auth setup failed:", error);
    // Fallback to simple auth if setup fails
    const simpleAuthModule = await import("./simpleAuth");
    await simpleAuthModule.setupAuth(app);
    console.log("✅ Fallback to simple auth completed");
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Questionnaire routes
  app.post('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertQuestionnaireResponseSchema.parse({
        ...req.body,
        userId,
      });

      const response = await storage.createQuestionnaireResponse(validatedData);
      res.json(response);
    } catch (error) {
      console.error("Error creating questionnaire response:", error);
      res.status(400).json({ message: "Invalid questionnaire data" });
    }
  });

  app.put('/api/questionnaire/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const questionnaireId = parseInt(req.params.id);
      
      // Verify ownership
      const existing = await storage.getQuestionnaireResponse(questionnaireId);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }

      const validatedData = insertQuestionnaireResponseSchema.partial().parse(req.body);
      const updated = await storage.updateQuestionnaireResponse(questionnaireId, validatedData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating questionnaire response:", error);
      res.status(400).json({ message: "Invalid questionnaire data" });
    }
  });

  app.get('/api/questionnaire/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responses = await storage.getUserQuestionnaireResponses(userId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching user questionnaire responses:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire responses" });
    }
  });

  // Eligibility routes
  app.post('/api/eligibility', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { questionnaireResponseId, noConviction, otherState, unsureState, unsureConviction } = req.body;

      // Get the questionnaire response
      const questionnaireResponse = await storage.getQuestionnaireResponse(questionnaireResponseId);
      if (!questionnaireResponse || questionnaireResponse.userId !== userId) {
        return res.status(404).json({ message: "Questionnaire response not found" });
      }

      let eligibility;
      
      // Handle special cases for different assessment types
      if (noConviction) {
        eligibility = {
          automaticExpungement: false,
          automaticSealing: false,
          petitionBasedSealing: false,
          eligibilityDetails: {
            primaryReason: "No marijuana conviction - no expungement needed",
            noConvictionCase: true,
            explanation: "Since you don't have a marijuana conviction, you don't need any expungement or sealing services. Your record is already clear of marijuana-related charges."
          },
          recommendations: [
            {
              type: "no_action",
              title: "No Action Required",
              description: "You don't have a marijuana conviction, so no expungement or sealing is necessary. Your record is already clear.",
              timeline: "N/A"
            },
            {
              type: "future_reference",
              title: "Keep This Assessment",
              description: "Save this assessment for your records. If you ever have questions about your criminal record, you can reference this evaluation.",
              timeline: "For future reference"
            },
            {
              type: "background_check",
              title: "Consider a Background Check",
              description: "If you're concerned about what appears on your record, consider obtaining an official background check to verify your record status.",
              timeline: "As needed"
            }
          ]
        };
      } else if (otherState) {
        eligibility = {
          automaticExpungement: false,
          automaticSealing: false,
          petitionBasedSealing: false,
          eligibilityDetails: {
            primaryReason: "Out-of-state conviction - New York laws do not apply",
            otherStateCase: true,
            explanation: "This assessment covers New York State marijuana expungement laws only. Your out-of-state conviction may be eligible for relief under that state's laws."
          },
          recommendations: [
            {
              type: "contact_attorney",
              title: "Contact Local Attorney",
              description: "Consult with an attorney licensed in the state where you were convicted to understand your expungement options.",
              timeline: "As soon as possible"
            },
            {
              type: "research_state_laws",
              title: "Research State-Specific Laws",
              description: "Each state has different marijuana expungement laws. Research the specific laws in your conviction state.",
              timeline: "Before taking action"
            },
            {
              type: "monitor_ny_residency",
              title: "Monitor New York Developments",
              description: "If you're a New York resident, stay informed about potential future changes to interstate expungement recognition.",
              timeline: "Ongoing"
            }
          ]
        };
      } else if (unsureState) {
        eligibility = {
          automaticExpungement: false,
          automaticSealing: false,
          petitionBasedSealing: false,
          eligibilityDetails: {
            primaryReason: "Jurisdiction unclear - need to determine conviction state",
            unsureStateCase: true,
            explanation: "To determine your eligibility for expungement, we need to know which state issued your conviction. Different states have different laws and procedures."
          },
          recommendations: [
            {
              type: "obtain_records",
              title: "Obtain Your Criminal Records",
              description: "Request your criminal history from the FBI or the state where you believe you were convicted to determine jurisdiction.",
              timeline: "1-2 weeks"
            },
            {
              type: "check_court_documents",
              title: "Review Court Documents",
              description: "Look for any court documents, tickets, or paperwork that might indicate which court and state handled your case.",
              timeline: "Immediate"
            },
            {
              type: "retake_assessment",
              title: "Retake Assessment",
              description: "Once you determine your conviction state, retake this assessment with the correct information.",
              timeline: "After obtaining records"
            }
          ]
        };
      } else if (unsureConviction) {
        eligibility = {
          automaticExpungement: false,
          automaticSealing: false,
          petitionBasedSealing: false,
          eligibilityDetails: {
            primaryReason: "Conviction status unclear - need to verify criminal history",
            unsureConvictionCase: true,
            explanation: "To provide accurate guidance, we need to confirm whether you have a marijuana-related conviction. This requires reviewing your official criminal history."
          },
          recommendations: [
            {
              type: "background_check",
              title: "Obtain Official Background Check",
              description: "Get an official criminal background check from New York State or the FBI to verify your conviction history.",
              timeline: "1-2 weeks"
            },
            {
              type: "review_documents",
              title: "Review Personal Records",
              description: "Look through any personal documents, court papers, or legal correspondence that might clarify your conviction status.",
              timeline: "Immediate"
            },
            {
              type: "legal_consultation",
              title: "Consider Legal Consultation",
              description: "If you're still unsure, a brief consultation with a criminal defense attorney can help clarify your status.",
              timeline: "As needed"
            }
          ]
        };
      } else {
        // Determine eligibility for users with confirmed NY convictions
        eligibility = determineEligibility(questionnaireResponse);
      }

      // Create eligibility result
      const resultData = insertEligibilityResultSchema.parse({
        userId,
        questionnaireResponseId,
        ...eligibility,
      });

      const result = await storage.createEligibilityResult(resultData);
      res.json(result);
    } catch (error) {
      console.error("Error creating eligibility result:", error);
      res.status(400).json({ message: "Failed to determine eligibility" });
    }
  });

  app.get('/api/eligibility/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const results = await storage.getUserEligibilityResults(userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching user eligibility results:", error);
      res.status(500).json({ message: "Failed to fetch eligibility results" });
    }
  });

  app.get('/api/eligibility/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const resultId = parseInt(req.params.id);
      
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      const result = await storage.getEligibilityResult(resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Eligibility result not found" });
      }
      
      // Ensure the result belongs to the authenticated user
      if (result.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching eligibility result:", error);
      res.status(500).json({ message: "Failed to fetch eligibility result" });
    }
  });

  // Premium subscription routes
  app.post('/api/premium/create-checkout-session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { 
        productType = "consultation",
        eligibilityType,
        userComplexity = "moderate"
      } = req.body;

      const { stripe, STRIPE_PRODUCTS, STRIPE_CONFIG } = await import('./stripe');

      // Validate product type
      if (!STRIPE_PRODUCTS[productType as keyof typeof STRIPE_PRODUCTS]) {
        return res.status(400).json({ message: "Invalid product type" });
      }

      const product = STRIPE_PRODUCTS[productType as keyof typeof STRIPE_PRODUCTS];

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${STRIPE_CONFIG.successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata: {
          userId,
          productType,
          eligibilityType: eligibilityType || '',
          userComplexity,
        },
        customer_email: req.user.email,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error("Error creating Stripe checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Handle successful payment (called after Stripe redirects back)
  app.post('/api/premium/confirm-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.body;
      const userId = req.user.claims.sub;

      const { stripe } = await import('./stripe');

      // Retrieve the checkout session
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ message: "Payment not completed" });
      }

      // Verify the session belongs to the authenticated user
      if (session.metadata?.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Create the premium subscription
      const subscriptionData = {
        userId,
        status: "active" as const,
        subscriptionType: session.metadata?.productType || "consultation",
        price: session.amount_total || 0,
        eligibilityType: session.metadata?.eligibilityType,
        userComplexity: session.metadata?.userComplexity || "moderate",
        stripeSessionId: sessionId,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdAt: new Date(),
      };

      const subscription = await storage.createPremiumSubscription(subscriptionData);
      
      res.json({
        ...subscription,
        message: "Premium subscription activated successfully",
        nextSteps: subscription.subscriptionType === "consultation" 
          ? "You'll receive an email within 24 hours to schedule your attorney consultation."
          : "Our legal team will contact you within 24 hours to begin your case."
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  app.get('/api/premium/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserPremiumSubscription(userId);
      res.json(subscription);
    } catch (error) {
      console.error("Error fetching user premium subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  // Premium case status endpoint
  app.get('/api/premium/case-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscription = await storage.getUserPremiumSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: "No premium subscription found" });
      }

      // Mock case status - in production, this would come from case management system
      const caseStatus = {
        subscriptionType: subscription.subscriptionType,
        status: subscription.status,
        createdAt: subscription.createdAt,
        currentStep: subscription.subscriptionType === "consultation" 
          ? "Scheduling consultation" 
          : "Initial case review",
        progress: 25,
        nextAction: subscription.subscriptionType === "consultation"
          ? "Attorney will contact you within 24 hours"
          : "Legal team is reviewing your case details",
        estimatedCompletion: subscription.subscriptionType === "consultation"
          ? "Within 1 week"
          : "2-4 weeks"
      };

      res.json(caseStatus);
    } catch (error) {
      console.error("Error fetching case status:", error);
      res.status(500).json({ message: "Failed to fetch case status" });
    }
  });

  // Education routes
  app.get('/api/education/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      
      if (!progress) {
        // Return default progress for new users
        return res.json({
          userId,
          completedModules: [],
          moduleScores: {},
          achievements: [],
          totalTimeSpent: 0,
          lastStudyDate: null,
          currentStreak: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching education progress:", error);
      res.status(500).json({ message: "Failed to fetch education progress" });
    }
  });

  app.post('/api/education/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { moduleId, completed, score, timeSpent } = req.body;
      
      // Get existing progress
      let existingProgress = await storage.getUserProgress(userId);
      
      if (!existingProgress) {
        // Create new progress record
        existingProgress = {
          userId,
          completedModules: [],
          moduleScores: {},
          achievements: [],
          totalTimeSpent: 0,
          lastStudyDate: null,
          currentStreak: 0
        } as any;
      }

      // Update progress data
      const updatedCompletedModules = completed && !existingProgress?.completedModules?.includes(moduleId)
        ? [...(existingProgress?.completedModules || []), moduleId]
        : existingProgress?.completedModules || [];

      const updatedModuleScores = score !== undefined
        ? { ...(existingProgress?.moduleScores || {}), [moduleId]: score }
        : existingProgress?.moduleScores || {};

      const updatedTotalTimeSpent = (existingProgress?.totalTimeSpent || 0) + (timeSpent || 0);

      // Calculate streak
      const today = new Date();
      const lastStudy = existingProgress?.lastStudyDate ? new Date(existingProgress.lastStudyDate) : null;
      let currentStreak = existingProgress?.currentStreak || 0;

      if (lastStudy) {
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak += 1;
        } else if (daysDiff > 1) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      // Simple achievement checking
      const newAchievements = [];
      const existingAchievementIds = existingProgress?.achievements || [];
      
      // First module achievement
      if (updatedCompletedModules.length >= 1 && !existingAchievementIds.includes('first-module')) {
        newAchievements.push('first-module');
      }
      
      // Perfect score achievement
      if (score === 100 && !existingAchievementIds.includes('quiz-master')) {
        newAchievements.push('quiz-master');
      }
      
      // Multiple modules achievement
      if (updatedCompletedModules.length >= 3 && !existingAchievementIds.includes('knowledge-seeker')) {
        newAchievements.push('knowledge-seeker');
      }
      
      // Study streak achievement
      if (currentStreak >= 7 && !existingAchievementIds.includes('streak-warrior')) {
        newAchievements.push('streak-warrior');
      }

      const updatedAchievements = [...existingAchievementIds, ...newAchievements];

      // Save updated progress
      const updatedProgress = await storage.upsertUserProgress({
        userId,
        completedModules: updatedCompletedModules,
        moduleScores: updatedModuleScores,
        achievements: updatedAchievements,
        totalTimeSpent: updatedTotalTimeSpent,
        lastStudyDate: today,
        currentStreak
      });

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating education progress:", error);
      res.status(500).json({ message: "Failed to update education progress" });
    }
  });

  // Chat API endpoint
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, userContext, chatHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Check if OpenAI API key is available
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your-api-key-here') {
        // Fallback response when no API key is configured
        return res.json({
          response: "**Chat Assistant (Demo Mode)**\n\nI'm currently in demo mode. To enable full AI chat functionality, please configure your OpenAI API key.\n\nFor now, here are some key points about NY marijuana expungement:\n\n• **MRTA 2021**: Automatic expungement for possession convictions before March 31, 2021\n• **Clean Slate Act**: Automatic sealing starting November 2024\n• **Petition-Based**: Court petition required for complex cases\n\n*This is general information only, not legal advice. Consult with a qualified attorney for case-specific guidance.*"
        });
      }

      // Initialize OpenAI
      const openai = new OpenAI({
        apiKey: apiKey
      });

      // Knowledge base for context
      const knowledgeBase = `
NY EXPUNGEMENT KNOWLEDGE BASE:

MRTA 2021 (Automatic Expungement):
- Applies to marijuana possession convictions before March 31, 2021
- 3 ounces or less
- Automatic process - no petition required
- Should already be completed by courts
- Citation: NY Cannabis Law § 222

Clean Slate Act (Effective November 2024):
- Automatic sealing of eligible records
- Misdemeanor: 3+ years after sentence completion, no other convictions
- Felony: 8+ years after sentence completion, no other convictions
- Excludes: Sex offenses, Class A felonies, pending charges, current supervision
- Citation: NY CPL § 160.59

Petition-Based Sealing (CPL § 160.59):
- 10+ years since conviction/sentence completion
- Maximum 2 total convictions, maximum 1 felony
- All sentence conditions completed
- No excluded offenses
- Requires formal court petition
- 6-12 months processing time

DEFINITIONS:
- Expungement: Complete destruction of records (MRTA 2021 only)
- Sealing: Records hidden from public but accessible to certain agencies
- Excluded offenses: Class A felonies, sex offenses requiring registration

STRICT GUIDELINES:
- Only answer NY marijuana expungement/sealing questions
- Never provide specific legal advice
- Always include legal disclaimers
- Redirect non-relevant questions
- Base responses only on provided knowledge
      `;

      // Build conversation context
      const systemPrompt = `You are a specialized AI assistant for NY marijuana expungement law. You have access to comprehensive, accurate information about New York State expungement and sealing laws.

STRICT GUIDELINES:
1. ONLY answer questions directly related to NY marijuana expungement, sealing, MRTA 2021, Clean Slate Act, or petition-based sealing
2. Base ALL responses on the provided knowledge base - never speculate or assume
3. Always include appropriate legal disclaimers
4. If asked about other topics, politely redirect to relevant legal resources
5. Never provide specific legal advice - only general information about laws and procedures
6. If uncertain about any detail, state that and recommend consulting an attorney

RESPONSE FORMAT:
- Start with direct answer to the question
- Include relevant legal citations when applicable  
- End with appropriate disclaimers
- Keep responses concise but comprehensive
- Use professional, accessible language

PROHIBITED RESPONSES:
- Case outcome predictions
- Other states' laws
- Immigration advice
- Employment law
- Federal law questions
- Specific legal strategy

Remember: You provide general legal information, not legal advice.

${knowledgeBase}

User Context: ${JSON.stringify(userContext)}`;

      // Build messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-4).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more consistent legal information
      });

      const response = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't generate a response. Please try again.";

      res.json({ response });
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat request',
        response: "I'm sorry, I'm having trouble responding right now. Please try again later or contact support if the issue persists."
      });
    }
  });

  app.get('/test-pdf-generation.html', (req, res) => {
    res.sendFile('/home/runner/workspace/client/public/test-pdf-generation.html');
  });

  app.get('/test-document-templates.html', (req, res) => {
    res.sendFile('/home/runner/workspace/test-document-templates.html');
  });

  const httpServer = createServer(app);
  return httpServer;
}
