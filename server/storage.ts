import {
  users,
  questionnaireResponses,
  eligibilityResults,
  premiumSubscriptions,
  userProgress,
  type User,
  type UpsertUser,
  type InsertQuestionnaireResponse,
  type QuestionnaireResponse,
  type InsertEligibilityResult,
  type EligibilityResult,
  type InsertPremiumSubscription,
  type PremiumSubscription,
  type InsertUserProgress,
  type UserProgress,
} from "../shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Questionnaire operations
  createQuestionnaireResponse(response: InsertQuestionnaireResponse): Promise<QuestionnaireResponse>;
  updateQuestionnaireResponse(id: number, response: Partial<InsertQuestionnaireResponse>): Promise<QuestionnaireResponse>;
  getQuestionnaireResponse(id: number): Promise<QuestionnaireResponse | undefined>;
  getUserQuestionnaireResponses(userId: string): Promise<QuestionnaireResponse[]>;
  
  // Eligibility operations
  createEligibilityResult(result: InsertEligibilityResult): Promise<EligibilityResult>;
  getEligibilityResult(id: number): Promise<EligibilityResult | undefined>;
  getUserEligibilityResults(userId: string): Promise<EligibilityResult[]>;
  
  // Premium operations
  createPremiumSubscription(subscription: InsertPremiumSubscription): Promise<PremiumSubscription>;
  getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | undefined>;
  
  // Education operations
  getUserProgress(userId: string): Promise<UserProgress | undefined>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

// Mock storage for local development
const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === "development") && (!process.env.DATABASE_URL || process.env.DATABASE_URL?.includes("dummy"));

// In-memory storage for development
const mockData = {
  users: new Map<string, User>(),
  questionnaireResponses: new Map<number, QuestionnaireResponse>(),
  eligibilityResults: new Map<number, EligibilityResult>(),
  premiumSubscriptions: new Map<number, PremiumSubscription>(),
  userProgress: new Map<string, UserProgress>(),
  nextId: 1
};

let database: any = null;

// Lazy initialization of database connection
async function getDatabase() {
  if (!database && !isDevelopment) {
    try {
      const { db: supabaseDb } = await import("./db");
      database = supabaseDb;
    } catch (error) {
      console.error("Failed to import database:", error);
      throw new Error("Database not available");
    }
  }
  return database;
}

export const storage = {
  async upsertUser(user: UpsertUser): Promise<User> {
    console.log("Storage: upsertUser called, isDevelopment:", isDevelopment);
    if (isDevelopment) {
      const existingUser = mockData.users.get(user.id);
      const newUser: User = {
        id: user.id,
        email: user.email || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        profileImageUrl: user.profileImageUrl || null,
        createdAt: existingUser?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      mockData.users.set(user.id, newUser);
      console.log("Storage: Created user in mock storage:", newUser);
      return newUser;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  },

  async getUser(userId: string): Promise<User | null> {
    if (isDevelopment) {
      return mockData.users.get(userId) || null;
    }
    
    const db = await getDatabase();
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    return user || null;
  },

  async createQuestionnaireResponse(data: InsertQuestionnaireResponse): Promise<QuestionnaireResponse> {
    console.log("Storage: createQuestionnaireResponse called, isDevelopment:", isDevelopment);
    console.log("Storage: Data received:", JSON.stringify(data, null, 2));
    if (isDevelopment) {
      const id = mockData.nextId++;
      const response: QuestionnaireResponse = {
        id,
        userId: data.userId,
        
        // Section 1: Basic Info
        convictionState: data.convictionState || null,
        hasMarijuanaConviction: data.hasMarijuanaConviction || null,
        offenseTypes: data.offenseTypes || null,
        convictionMonth: data.convictionMonth || null,
        convictionYear: data.convictionYear || null,
        knowsPenalCode: data.knowsPenalCode || null,
        penalCode: data.penalCode || null,
        
        // Section 2: MRTA Eligibility
        possessionAmount: data.possessionAmount || null,
        ageAtOffense: data.ageAtOffense || null,
        receivedNotice: data.receivedNotice || null,
        
        // Section 3: Clean Slate Act
        convictionLevel: data.convictionLevel || null,
        servedTime: data.servedTime || null,
        releaseMonth: data.releaseMonth || null,
        releaseYear: data.releaseYear || null,
        otherConvictions: data.otherConvictions || null,
        onSupervision: data.onSupervision || null,
        hasExcludedOffenses: data.hasExcludedOffenses || null,
        
        // Section 4: Petition-Based Sealing
        totalConvictions: data.totalConvictions || null,
        totalFelonies: data.totalFelonies || null,
        sentenceCompleted: data.sentenceCompleted || null,
        
        // Section 5: Record Verification
        hasRecords: data.hasRecords || null,
        wantsRapAssistance: data.wantsRapAssistance || null,
        uploadedDocument: data.uploadedDocument || null,
        
        // Legacy fields
        age: data.age || null,
        county: data.county || null,
        chargeTypes: data.chargeTypes || null,
        firstArrestDate: data.firstArrestDate || null,
        convictionDetails: data.convictionDetails || null,
        
        completed: data.completed || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockData.questionnaireResponses.set(id, response);
      console.log("Storage: Created questionnaire response in mock storage:", response);
      return response;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .insert(schema.questionnaireResponses)
      .values(data)
      .returning();
    return result;
  },

  async updateQuestionnaireResponse(id: number, data: Partial<InsertQuestionnaireResponse>): Promise<QuestionnaireResponse> {
    if (isDevelopment) {
      const existing = mockData.questionnaireResponses.get(id);
      if (!existing) throw new Error("Questionnaire response not found");
      
      const updated: QuestionnaireResponse = {
        ...existing,
        // Update any provided fields
        ...(data.convictionState !== undefined && { convictionState: data.convictionState }),
        ...(data.hasMarijuanaConviction !== undefined && { hasMarijuanaConviction: data.hasMarijuanaConviction }),
        ...(data.offenseTypes !== undefined && { offenseTypes: data.offenseTypes }),
        ...(data.convictionMonth !== undefined && { convictionMonth: data.convictionMonth }),
        ...(data.convictionYear !== undefined && { convictionYear: data.convictionYear }),
        ...(data.knowsPenalCode !== undefined && { knowsPenalCode: data.knowsPenalCode }),
        ...(data.penalCode !== undefined && { penalCode: data.penalCode }),
        ...(data.possessionAmount !== undefined && { possessionAmount: data.possessionAmount }),
        ...(data.ageAtOffense !== undefined && { ageAtOffense: data.ageAtOffense }),
        ...(data.receivedNotice !== undefined && { receivedNotice: data.receivedNotice }),
        ...(data.convictionLevel !== undefined && { convictionLevel: data.convictionLevel }),
        ...(data.servedTime !== undefined && { servedTime: data.servedTime }),
        ...(data.releaseMonth !== undefined && { releaseMonth: data.releaseMonth }),
        ...(data.releaseYear !== undefined && { releaseYear: data.releaseYear }),
        ...(data.otherConvictions !== undefined && { otherConvictions: data.otherConvictions }),
        ...(data.onSupervision !== undefined && { onSupervision: data.onSupervision }),
        ...(data.hasExcludedOffenses !== undefined && { hasExcludedOffenses: data.hasExcludedOffenses }),
        ...(data.totalConvictions !== undefined && { totalConvictions: data.totalConvictions }),
        ...(data.totalFelonies !== undefined && { totalFelonies: data.totalFelonies }),
        ...(data.sentenceCompleted !== undefined && { sentenceCompleted: data.sentenceCompleted }),
        ...(data.hasRecords !== undefined && { hasRecords: data.hasRecords }),
        ...(data.wantsRapAssistance !== undefined && { wantsRapAssistance: data.wantsRapAssistance }),
        ...(data.uploadedDocument !== undefined && { uploadedDocument: data.uploadedDocument }),
        ...(data.age !== undefined && { age: data.age }),
        ...(data.county !== undefined && { county: data.county }),
        ...(data.chargeTypes !== undefined && { chargeTypes: data.chargeTypes }),
        ...(data.firstArrestDate !== undefined && { firstArrestDate: data.firstArrestDate }),
        ...(data.convictionDetails !== undefined && { convictionDetails: data.convictionDetails }),
        ...(data.completed !== undefined && { completed: data.completed }),
        updatedAt: new Date(),
      };
      mockData.questionnaireResponses.set(id, updated);
      return updated;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .update(schema.questionnaireResponses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.questionnaireResponses.id, id))
      .returning();
    return result;
  },

  async getQuestionnaireResponse(id: number): Promise<QuestionnaireResponse | undefined> {
    if (isDevelopment) {
      return mockData.questionnaireResponses.get(id) || undefined;
    }
    
    const db = await getDatabase();
    const [response] = await db
      .select()
      .from(schema.questionnaireResponses)
      .where(eq(schema.questionnaireResponses.id, id))
      .limit(1);
    return response || undefined;
  },

  async getUserQuestionnaireResponses(userId: string): Promise<QuestionnaireResponse[]> {
    console.log("Storage: getUserQuestionnaireResponses called for userId:", userId, "isDevelopment:", isDevelopment);
    if (isDevelopment) {
      const responses = Array.from(mockData.questionnaireResponses.values())
        .filter(response => response.userId === userId);
      console.log("Storage: Found responses in mock storage:", responses.length);
      return responses;
    }
    
    const db = await getDatabase();
    return await db
      .select()
      .from(schema.questionnaireResponses)
      .where(eq(schema.questionnaireResponses.userId, userId))
      .orderBy(desc(schema.questionnaireResponses.createdAt));
  },

  async createEligibilityResult(data: InsertEligibilityResult): Promise<EligibilityResult> {
    if (isDevelopment) {
      const id = mockData.nextId++;
      const result: EligibilityResult = {
        id,
        userId: data.userId,
        questionnaireResponseId: data.questionnaireResponseId,
        automaticExpungement: data.automaticExpungement || null,
        automaticSealing: data.automaticSealing || null,
        petitionBasedSealing: data.petitionBasedSealing || null,
        eligibilityDetails: data.eligibilityDetails || null,
        recommendations: data.recommendations || null,
        createdAt: new Date(),
      };
      mockData.eligibilityResults.set(id, result);
      console.log("Created eligibility result in mock storage:", result);
      return result;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .insert(schema.eligibilityResults)
      .values(data)
      .returning();
    return result;
  },

  async getEligibilityResult(id: number): Promise<EligibilityResult | null> {
    if (isDevelopment) {
      const result = mockData.eligibilityResults.get(id) || null;
      console.log("Retrieved eligibility result from mock storage:", id, result);
      return result;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .select()
      .from(schema.eligibilityResults)
      .where(eq(schema.eligibilityResults.id, id))
      .limit(1);
    return result || null;
  },

  async getUserEligibilityResults(userId: string): Promise<EligibilityResult[]> {
    if (isDevelopment) {
      return Array.from(mockData.eligibilityResults.values())
        .filter(result => result.userId === userId);
    }
    
    const db = await getDatabase();
    return await db
      .select()
      .from(schema.eligibilityResults)
      .where(eq(schema.eligibilityResults.userId, userId))
      .orderBy(desc(schema.eligibilityResults.createdAt));
  },

  async createPremiumSubscription(data: InsertPremiumSubscription): Promise<PremiumSubscription> {
    if (isDevelopment) {
      const id = mockData.nextId++;
      const subscription: PremiumSubscription = {
        id,
        userId: data.userId,
        status: data.status,
        subscriptionType: data.subscriptionType,
        price: data.price || null,
        eligibilityType: data.eligibilityType || null,
        userComplexity: data.userComplexity || null,
        stripeSessionId: data.stripeSessionId || null,
        expiresAt: data.expiresAt || null,
        createdAt: new Date(),
      };
      mockData.premiumSubscriptions.set(id, subscription);
      return subscription;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .insert(schema.premiumSubscriptions)
      .values(data)
      .returning();
    return result;
  },

  async getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | null> {
    if (isDevelopment) {
      return Array.from(mockData.premiumSubscriptions.values())
        .find(sub => sub.userId === userId && sub.status === "active") || null;
    }
    
    const db = await getDatabase();
    const [subscription] = await db
      .select()
      .from(schema.premiumSubscriptions)
      .where(and(
        eq(schema.premiumSubscriptions.userId, userId),
        eq(schema.premiumSubscriptions.status, "active")
      ))
      .orderBy(desc(schema.premiumSubscriptions.createdAt))
      .limit(1);
    return subscription || null;
  },

  async getUserProgress(userId: string): Promise<UserProgress | null> {
    if (isDevelopment) {
      return mockData.userProgress.get(userId) || null;
    }
    
    const db = await getDatabase();
    const [progress] = await db
      .select()
      .from(schema.userProgress)
      .where(eq(schema.userProgress.userId, userId))
      .limit(1);
    return progress || null;
  },

  async upsertUserProgress(data: InsertUserProgress): Promise<UserProgress> {
    if (isDevelopment) {
      const existing = mockData.userProgress.get(data.userId);
      const progress: UserProgress = {
        id: existing?.id || mockData.nextId++,
        userId: data.userId,
        completedModules: data.completedModules || null,
        moduleScores: data.moduleScores || null,
        achievements: data.achievements || null,
        totalTimeSpent: data.totalTimeSpent || null,
        lastStudyDate: data.lastStudyDate || null,
        currentStreak: data.currentStreak || null,
        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      mockData.userProgress.set(data.userId, progress);
      return progress;
    }
    
    const db = await getDatabase();
    const [result] = await db
      .insert(schema.userProgress)
      .values(data)
      .onConflictDoUpdate({
        target: schema.userProgress.userId,
        set: {
          completedModules: data.completedModules,
          moduleScores: data.moduleScores,
          achievements: data.achievements,
          totalTimeSpent: data.totalTimeSpent,
          lastStudyDate: data.lastStudyDate,
          currentStreak: data.currentStreak,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  },
};
