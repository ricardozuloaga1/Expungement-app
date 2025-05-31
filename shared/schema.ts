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
  age: varchar("age"), // "under_21" | "21_or_older"
  county: varchar("county"),
  chargeTypes: jsonb("charge_types"), // Array of charge types
  firstArrestDate: varchar("first_arrest_date"), // "before_march_2021" | "after_march_2021" | "not_sure"
  convictionDetails: jsonb("conviction_details"), // Additional conviction details
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
  subscriptionType: varchar("subscription_type").notNull(), // "premium_help"
  price: integer("price"), // in cents
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  questionnaireResponses: many(questionnaireResponses),
  eligibilityResults: many(eligibilityResults),
  premiumSubscriptions: many(premiumSubscriptions),
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

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertQuestionnaireResponse = z.infer<typeof insertQuestionnaireResponseSchema>;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type InsertEligibilityResult = z.infer<typeof insertEligibilityResultSchema>;
export type EligibilityResult = typeof eligibilityResults.$inferSelect;
export type InsertPremiumSubscription = z.infer<typeof insertPremiumSubscriptionSchema>;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;
