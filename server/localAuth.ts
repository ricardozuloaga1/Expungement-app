import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";

// Simple local auth for development
export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      sameSite: 'lax'
    },
  });
}

export async function setupAuth(app: Express) {
  app.use(getSession());

  // Mock login for development
  app.get("/api/login", async (req: any, res) => {
    try {
      // Create a mock user for local development
      const mockUser = {
        id: "local-dev-user",
        email: "ricardo@example.com",
        firstName: "Ricardo",
        lastName: "User",
        profileImageUrl: null,
      };

      // Skip database storage for local development with dummy DB
      // await storage.upsertUser(mockUser);

      // Set session
      req.session.user = {
        claims: {
          sub: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.firstName,
          last_name: mockUser.lastName,
        },
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
      };

      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });

  // Mock user endpoint for development
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mockUser = {
      id: req.session.user.claims.sub,
      email: req.session.user.claims.email,
      firstName: req.session.user.claims.first_name,
      lastName: req.session.user.claims.last_name,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json(mockUser);
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > req.session.user.expires_at) {
    req.session.destroy();
    return res.status(401).json({ message: "Session expired" });
  }

  // Attach user to request for compatibility
  req.user = req.session.user;
  next();
}; 