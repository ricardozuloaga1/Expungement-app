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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Questionnaire operations
  async createQuestionnaireResponse(response: InsertQuestionnaireResponse): Promise<QuestionnaireResponse> {
    const [created] = await db
      .insert(questionnaireResponses)
      .values(response)
      .returning();
    return created;
  }

  async updateQuestionnaireResponse(id: number, response: Partial<InsertQuestionnaireResponse>): Promise<QuestionnaireResponse> {
    const [updated] = await db
      .update(questionnaireResponses)
      .set({ ...response, updatedAt: new Date() })
      .where(eq(questionnaireResponses.id, id))
      .returning();
    return updated;
  }

  async getQuestionnaireResponse(id: number): Promise<QuestionnaireResponse | undefined> {
    const [response] = await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.id, id));
    return response;
  }

  async getUserQuestionnaireResponses(userId: string): Promise<QuestionnaireResponse[]> {
    return await db
      .select()
      .from(questionnaireResponses)
      .where(eq(questionnaireResponses.userId, userId))
      .orderBy(desc(questionnaireResponses.createdAt));
  }

  // Eligibility operations
  async createEligibilityResult(result: InsertEligibilityResult): Promise<EligibilityResult> {
    const [created] = await db
      .insert(eligibilityResults)
      .values(result)
      .returning();
    return created;
  }

  async getEligibilityResult(id: number): Promise<EligibilityResult | undefined> {
    const [result] = await db
      .select()
      .from(eligibilityResults)
      .where(eq(eligibilityResults.id, id));
    return result;
  }

  async getUserEligibilityResults(userId: string): Promise<EligibilityResult[]> {
    return await db
      .select()
      .from(eligibilityResults)
      .where(eq(eligibilityResults.userId, userId))
      .orderBy(desc(eligibilityResults.createdAt));
  }

  // Premium operations
  async createPremiumSubscription(subscription: InsertPremiumSubscription): Promise<PremiumSubscription> {
    const [created] = await db
      .insert(premiumSubscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  async getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(premiumSubscriptions)
      .where(eq(premiumSubscriptions.userId, userId))
      .orderBy(desc(premiumSubscriptions.createdAt));
    return subscription;
  }

  // Education operations
  async getUserProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress;
  }

  async upsertUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(progressData)
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          ...progressData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }
}

export const storage = new DatabaseStorage();
