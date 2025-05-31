import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertQuestionnaireResponseSchema, insertEligibilityResultSchema } from "@shared/schema";
import { z } from "zod";

// Eligibility determination logic
function determineEligibility(responses: any) {
  const {
    age,
    chargeTypes = [],
    firstArrestDate,
  } = responses;

  let automaticExpungement = false;
  let petitionBasedSealing = false;
  const recommendations = [];
  const eligibilityDetails: any = {};

  // Check for automatic expungement under MRTA 2021
  if (firstArrestDate === "before_march_2021") {
    const possessionCharges = chargeTypes.includes("possession");
    if (possessionCharges) {
      automaticExpungement = true;
      eligibilityDetails.automaticReason = "MRTA 2021 - Possession charges before March 31, 2021";
      recommendations.push({
        type: "automatic",
        title: "Monitor Automatic Expungement Status",
        description: "Check with the court clerk's office in 3-6 months for automatic processing updates.",
        timeline: "3-6 months"
      });
    }
  }

  // Check for petition-based sealing
  const saleCharges = chargeTypes.includes("sale");
  const cultivationCharges = chargeTypes.includes("cultivation");
  
  if (saleCharges || cultivationCharges) {
    petitionBasedSealing = true;
    eligibilityDetails.petitionReason = "Sale or cultivation charges require petition-based sealing";
    recommendations.push({
      type: "petition",
      title: "File Petition for Record Sealing",
      description: "Sale and cultivation charges require a formal petition to the court.",
      timeline: "6-12 months"
    });
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
