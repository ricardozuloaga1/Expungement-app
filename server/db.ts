import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure postgres connection for Supabase
let connectionString = process.env.DATABASE_URL;

// For Vercel, ensure proper SSL and connection parameters
if (process.env.VERCEL && connectionString) {
  // Add SSL parameters if not already present
  if (!connectionString.includes('sslmode=')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}sslmode=require&connect_timeout=15`;
  }
}

// Create postgres client with proper configuration for Supabase
const client = postgres(connectionString, {
  max: process.env.VERCEL ? 1 : 10, // Limit connections in serverless environment
  idle_timeout: 20,
  max_lifetime: 60 * 30, // 30 minutes
  ssl: process.env.VERCEL ? 'require' : 'require',
  prepare: false, // Disable prepared statements for Vercel
  transform: {
    undefined: null,
  },
});

// Initialize Drizzle with explicit schema
export const db = drizzle(client, { 
  schema: schema,
  logger: process.env.NODE_ENV === 'development'
});

// For backward compatibility, export pool as well
export const pool = client;

// Export schema for direct access if needed
export { schema };