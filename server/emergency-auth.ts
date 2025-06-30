import type { Express, RequestHandler } from "express";

// Ultra-simple auth that will definitely work on Vercel
export async function setupEmergencyAuth(app: Express) {
  console.log("🚨 Using EMERGENCY AUTH - super simple mode");
  
  // Simple login - just redirects home
  app.get("/api/login", (req, res) => {
    console.log("Emergency login GET");
    // Set a simple session identifier
    res.cookie('emergency_auth', 'logged_in', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    res.redirect("/");
  });

  // Simple POST login
  app.post("/api/login", (req, res) => {
    console.log("Emergency login POST", req.body);
    // Set a simple session identifier
    res.cookie('emergency_auth', 'logged_in', {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });
    res.json({ success: true, user: { id: 'emergency-user', email: 'user@example.com' } });
  });

  // Simple user endpoint
  app.get("/api/auth/user", (req, res) => {
    console.log("Emergency auth/user", req.cookies);
    if (req.cookies?.emergency_auth === 'logged_in') {
      res.json({ 
        id: 'emergency-user', 
        email: 'user@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('emergency_auth');
    res.json({ message: "Logged out" });
  });
}

export const emergencyAuthMiddleware: RequestHandler = (req: any, res, next) => {
  console.log("Emergency auth middleware", req.cookies);
  if (req.cookies?.emergency_auth === 'logged_in') {
    req.user = { claims: { sub: 'emergency-user' } };
    next();
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
}; 