import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Questionnaire responses table
export const questionnaireResponses = pgTable("questionnaire_responses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Section 1: Basic Info
  convictionState: varchar("conviction_state"),
  hasMarijuanaConviction: varchar("has_marijuana_conviction"),
  offenseTypes: jsonb("offense_types"), // Array of offense types
  convictionMonth: varchar("conviction_month"),
  convictionYear: varchar("conviction_year"),
  knowsPenalCode: varchar("knows_penal_code"),
  penalCode: varchar("penal_code"),
  
  // Section 2: MRTA Eligibility
  possessionAmount: varchar("possession_amount"),
  ageAtOffense: varchar("age_at_offense"),
  receivedNotice: varchar("received_notice"),
  
  // Section 3: Clean Slate Act
  convictionLevel: varchar("conviction_level"),
  servedTime: varchar("served_time"),
  releaseMonth: varchar("release_month"),
  releaseYear: varchar("release_year"),
  otherConvictions: varchar("other_convictions"),
  onSupervision: varchar("on_supervision"),
  hasExcludedOffenses: varchar("has_excluded_offenses"),
  
  // Section 4: Petition-Based Sealing
  totalConvictions: varchar("total_convictions"),
  totalFelonies: varchar("total_felonies"),
  sentenceCompleted: varchar("sentence_completed"),
  
  // Section 5: Record Verification
  hasRecords: varchar("has_records"),
  wantsRapAssistance: varchar("wants_rap_assistance"),
  uploadedDocument: varchar("uploaded_document"),
  
  // Legacy fields for backward compatibility
  age: varchar("age"),
  county: varchar("county"),
  chargeTypes: jsonb("charge_types"),
  firstArrestDate: varchar("first_arrest_date"),
  convictionDetails: jsonb("conviction_details"),
  
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Eligibility results table
export const eligibilityResults = pgTable("eligibility_results", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionnaireResponseId: integer("questionnaire_response_id").notNull().references(() => questionnaireResponses.id),
  automaticExpungement: boolean("automatic_expungement").default(false),
  automaticSealing: boolean("automatic_sealing").default(false),
  petitionBasedSealing: boolean("petition_based_sealing").default(false),
  eligibilityDetails: jsonb("eligibility_details"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Premium subscriptions table
export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull(), // "active" | "cancelled" | "expired"
  subscriptionType: varchar("subscription_type").notNull(), // "consultation" | "full_service"
  price: integer("price"), // in cents
  eligibilityType: varchar("eligibility_type"), // The user's eligibility type when they subscribed
  userComplexity: varchar("user_complexity"), // "simple" | "moderate" | "complex"
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Education system tables
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  completedModules: text("completed_modules").array().default([]),
  moduleScores: jsonb("module_scores").default({}),
  achievements: text("achievements").array().default([]),
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  lastStudyDate: timestamp("last_study_date"),
  currentStreak: integer("current_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  questionnaireResponses: many(questionnaireResponses),
  eligibilityResults: many(eligibilityResults),
  premiumSubscriptions: many(premiumSubscriptions),
  progress: one(userProgress),
}));

export const questionnaireResponsesRelations = relations(questionnaireResponses, ({ one, many }) => ({
  user: one(users, {
    fields: [questionnaireResponses.userId],
    references: [users.id],
  }),
  eligibilityResults: many(eligibilityResults),
}));

export const eligibilityResultsRelations = relations(eligibilityResults, ({ one }) => ({
  user: one(users, {
    fields: [eligibilityResults.userId],
    references: [users.id],
  }),
  questionnaireResponse: one(questionnaireResponses, {
    fields: [eligibilityResults.questionnaireResponseId],
    references: [questionnaireResponses.id],
  }),
}));

export const premiumSubscriptionsRelations = relations(premiumSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [premiumSubscriptions.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertQuestionnaireResponseSchema = createInsertSchema(questionnaireResponses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEligibilityResultSchema = createInsertSchema(eligibilityResults).omit({
  id: true,
  createdAt: true,
});

export const insertPremiumSubscriptionSchema = createInsertSchema(premiumSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertQuestionnaireResponse = z.infer<typeof insertQuestionnaireResponseSchema>;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertEligibilityResult = z.infer<typeof insertEligibilityResultSchema>;
export type EligibilityResult = typeof eligibilityResults.$inferSelect;
export type InsertPremiumSubscription = z.infer<typeof insertPremiumSubscriptionSchema>;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
