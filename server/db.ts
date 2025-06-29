import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure postgres connection for Supabase
const connectionString = process.env.DATABASE_URL;

// Create postgres client with proper configuration for Supabase
const client = postgres(connectionString, {
  max: process.env.VERCEL ? 1 : 10, // Limit connections in serverless environment
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export const db = drizzle(client, { schema });

// For backward compatibility, export pool as well
export const pool = client;