// Vercel API handler for all Express routes
import app from '../dist/server/index.js';

export default async function handler(req, res) {
  return app(req, res);
} 