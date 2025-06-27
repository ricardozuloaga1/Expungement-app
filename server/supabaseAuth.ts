import type { Express, RequestHandler } from "express";

// Note: Install with: npm install @supabase/supabase-js
// You'll need these environment variables:
// SUPABASE_URL=https://your-project.supabase.co
// SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

let supabase: any = null;

// Initialize Supabase only if credentials are available
async function initSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase credentials not found, falling back to simple auth");
    return null;
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } catch (error) {
    console.warn("Supabase not installed, falling back to simple auth");
    return null;
  }
}

export async function setupAuth(app: Express) {
  supabase = await initSupabase();
  
  // Enhanced login endpoint that works with both email/password and magic links
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!supabase) {
        // Fallback to simple JWT auth if Supabase not available
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
        
        const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const token = jwt.sign({
          sub: userId,
          email: email || `user-${Date.now()}@cleanslater.com`,
          first_name: firstName,
          last_name: lastName,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
        }, JWT_SECRET);

        res.cookie('auth_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
          sameSite: 'lax'
        });

        return res.json({ success: true, fallback: true });
      }

      // Supabase authentication
      if (password) {
        // Email/password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If user doesn't exist, create them
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                firstName,
                lastName,
              }
            }
          });
          
          if (signUpError) throw signUpError;
          return res.json({ 
            success: true, 
            user: signUpData.user, 
            session: signUpData.session,
            newUser: true
          });
        }

        return res.json({ 
          success: true, 
          user: data.user, 
          session: data.session 
        });
      } else {
        // Magic link login (passwordless)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${req.protocol}://${req.get('host')}/auth/callback`
          }
        });

        if (error) throw error;
        
        return res.json({ 
          success: true, 
          message: "Check your email for the login link",
          magicLink: true
        });
      }
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Authentication failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      if (!supabase) {
        // Fallback JWT verification
        const jwt = await import('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
        
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        
        // Sync with existing storage
        const { storage } = await import("./storage");
        const user = await storage.upsertUser({
          id: decoded.sub,
          email: decoded.email,
          firstName: decoded.first_name,
          lastName: decoded.last_name,
          profileImageUrl: null,
        });

        return res.json(user);
      }

      // Supabase user verification
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ message: "Invalid token" });
      }

      // Sync with your existing user storage
      const { storage } = await import("./storage");
      const existingUser = await storage.upsertUser({
        id: user.id,
        email: user.email || null,
        firstName: user.user_metadata?.firstName || null,
        lastName: user.user_metadata?.lastName || null,
        profileImageUrl: user.user_metadata?.avatar_url || null,
      });

      res.json(existingUser);
    } catch (error) {
      console.error("User verification error:", error);
      res.status(401).json({ message: "Token verification failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      if (supabase) {
        const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          await supabase.auth.signOut();
        }
      }
      
      res.clearCookie('auth_token');
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Password reset endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!supabase) {
        return res.status(501).json({ message: "Password reset requires Supabase" });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.protocol}://${req.get('host')}/reset-password`
      });

      if (error) throw error;

      res.json({ 
        success: true, 
        message: "Password reset email sent" 
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Password reset failed" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token" });
    }

    if (!supabase) {
      // Fallback JWT verification
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
      
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({ message: "Token expired" });
      }

      req.user = {
        claims: {
          sub: decoded.sub,
          email: decoded.email,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
        }
      };

      return next();
    }

    // Supabase token verification
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = {
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.user_metadata?.firstName,
        last_name: user.user_metadata?.lastName,
      }
    };

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
}; 