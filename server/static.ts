import path from "path";
import express, { type Express } from "express";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "public");
  
  // Serve static files from the built client directory
  app.use(express.static(distPath, {
    maxAge: process.env.NODE_ENV === "production" ? '1y' : 0,
    etag: true,
    lastModified: true,
  }));
  
  // SPA fallback: serve index.html for all unmatched routes
  // This allows client-side routing to work properly
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(distPath, 'index.html'));
  });
} 