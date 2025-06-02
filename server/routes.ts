import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuestionnaireResponseSchema, insertEligibilityResultSchema } from "@shared/schema";
import { z } from "zod";

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
    offenseTypes = [],
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
    chargeTypes = [],
    firstArrestDate,
  } = responses;

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
  if (offenseTypes.includes("possession") && possessionAmount === "yes") {
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

  // Check for Petition-Based Sealing
  if (tenYearsPassed === "yes" && 
      parseInt(totalConvictions || "0") <= 2 && 
      parseInt(totalFelonies || "0") <= 1) {
    
    petitionBasedSealing = true;
    eligibilityDetails.primaryReason = "Eligible for petition-based sealing under CPL § 160.59";
    eligibilityDetails.petitionApplicable = true;
    
    recommendations.push({
      type: "petition",
      title: "File Court Petition for Record Sealing",
      description: "You can petition the court for record sealing. This requires a formal application and court approval.",
      timeline: "6-12 months"
    });
    
    recommendations.push({
      type: "legal_help",
      title: "Consider Legal Assistance",
      description: "Petition-based sealing has specific requirements. Legal help can improve your chances of success.",
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
  } else if (parseInt(totalConvictions || "0") > 2) {
    eligibilityDetails.primaryReason = "Too many total convictions for petition-based sealing (maximum 2)";
  } else if (tenYearsPassed === "no") {
    eligibilityDetails.primaryReason = "Less than 10 years have passed since conviction for petition-based sealing";
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
  // Auth middleware
  await setupAuth(app);

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
      const { questionnaireResponseId } = req.body;

      // Get the questionnaire response
      const questionnaireResponse = await storage.getQuestionnaireResponse(questionnaireResponseId);
      if (!questionnaireResponse || questionnaireResponse.userId !== userId) {
        return res.status(404).json({ message: "Questionnaire response not found" });
      }

      // Determine eligibility
      const eligibility = determineEligibility(questionnaireResponse);

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

  // Premium subscription routes
  app.post('/api/premium/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { subscriptionType = "premium_help", price = 29900 } = req.body; // $299 in cents

      const subscriptionData = {
        userId,
        status: "active",
        subscriptionType,
        price,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      };

      const subscription = await storage.createPremiumSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating premium subscription:", error);
      res.status(400).json({ message: "Failed to create subscription" });
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

  // Serve the test HTML file
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
      const updatedCompletedModules = completed && !existingProgress.completedModules.includes(moduleId)
        ? [...existingProgress.completedModules, moduleId]
        : existingProgress.completedModules;

      const updatedModuleScores = score !== undefined
        ? { ...existingProgress.moduleScores, [moduleId]: score }
        : existingProgress.moduleScores;

      const updatedTotalTimeSpent = (existingProgress.totalTimeSpent || 0) + (timeSpent || 0);

      // Calculate streak
      const today = new Date();
      const lastStudy = existingProgress.lastStudyDate ? new Date(existingProgress.lastStudyDate) : null;
      let currentStreak = existingProgress.currentStreak || 0;

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
      const existingAchievementIds = existingProgress.achievements || [];
      
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

  app.get('/test-pdf-generation.html', (req, res) => {
    res.sendFile('/home/runner/workspace/client/public/test-pdf-generation.html');
  });

  app.get('/test-document-templates.html', (req, res) => {
    res.sendFile('/home/runner/workspace/test-document-templates.html');
  });

  const httpServer = createServer(app);
  return httpServer;
}
