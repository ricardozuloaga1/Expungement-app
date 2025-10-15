import type { Express, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Simple JWT-based auth that works in serverless
export async function setupAuth(app: Express) {
  // Login endpoint - accepts email and name parameters or uses defaults
  app.get("/api/login", async (req, res) => {
    try {
      // Get email and name from query parameters or use defaults
      const email = req.query.email as string || "user@cleanslater.com";
      const fullName = req.query.name as string || "";
      
      // Generate unique user ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Parse the full name to get first name
      let firstName = "";
      if (fullName.trim()) {
        firstName = fullName.trim().split(' ')[0]; // Take first word as first name
      } else {
        // Fallback: Extract first name from email (part before @)
        const emailParts = email.split('@');
        const emailPrefix = emailParts[0];
        firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      
      const mockUser = {
        id: userId,
        email: email,
        firstName: firstName,
        lastName: null,
        profileImageUrl: null,
      };

      // Create JWT token
      const token = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
        },
        JWT_SECRET
      );

      // Set cookie and redirect
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: 'lax'
      });

      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // POST login endpoint for form submissions
  app.post("/api/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      const userEmail = email || "user@cleanslater.com";
      const fullName = name || "";
      
      // Generate unique user ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Parse the full name to get first name
      let firstName = "";
      if (fullName.trim()) {
        firstName = fullName.trim().split(' ')[0]; // Take first word as first name
      } else {
        // Fallback: Extract first name from email (part before @)
        const emailParts = userEmail.split('@');
        const emailPrefix = emailParts[0];
        firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }
      
      const mockUser = {
        id: userId,
        email: userEmail,
        firstName: firstName,
        lastName: null,
        profileImageUrl: null,
      };

      // Create JWT token
      const token = jwt.sign(
        {
          sub: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
        },
        JWT_SECRET
      );

      // Set cookie and return success
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: 'lax'
      });

      res.json({ success: true, user: mockUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/logout", (req, res) => {
    res.clearCookie('auth_token');
    res.redirect("/");
  });

  // Note: /api/auth/user endpoint is handled by routes.js with isAuthenticated middleware
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    console.log("🔍 Auth middleware - cookies:", req.cookies);
    const token = req.cookies?.auth_token;
    if (!token) {
      console.log("🔍 Auth middleware - no token found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("🔍 Auth middleware - token found:", token.substring(0, 20) + "...");
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      console.log("🔍 Auth middleware - token expired");
      return res.status(401).json({ message: "Token expired" });
    }

    console.log("🔍 Auth middleware - token valid, user:", decoded.sub);
    // Attach user to request
    req.user = {
      claims: {
        sub: decoded.sub,
        email: decoded.email,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
      }
    };

    next();
  } catch (error) {
    console.log("🔍 Auth middleware - error:", error instanceof Error ? error.message : String(error));
    res.status(401).json({ message: "Unauthorized" });
  }
}; 