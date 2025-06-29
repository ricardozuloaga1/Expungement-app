import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "../shared/schema";

// Only set WebSocket constructor if we're not on Vercel
if (!process.env.VERCEL) {
  try {
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch (error) {
    console.warn("WebSocket not available, continuing without it");
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });