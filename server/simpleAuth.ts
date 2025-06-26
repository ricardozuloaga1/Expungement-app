import type { Express, RequestHandler } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Simple JWT-based auth that works in serverless
export async function setupAuth(app: Express) {
  // Mock login endpoint
  app.get("/api/login", async (req, res) => {
    try {
      // Create a mock user token
      const mockUser = {
        id: "prod-user-123",
        email: "user@example.com",
        firstName: "Test",
        lastName: "User",
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

  app.get("/api/logout", (req, res) => {
    res.clearCookie('auth_token');
    res.redirect("/");
  });

  // User endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.cookies?.auth_token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const user = {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.first_name,
        lastName: decoded.last_name,
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if token is expired
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: "Token expired" });
    }

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
    res.status(401).json({ message: "Unauthorized" });
  }
}; 