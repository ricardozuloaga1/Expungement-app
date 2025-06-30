import type { Express, RequestHandler } from "express";
import { createClient } from '@supabase/supabase-js';
import { storage } from "./storage";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase admin client for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function setupAuth(app: Express) {
  
  // Helper function to add timeout to async operations
  const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  };

  // Login endpoint - creates user with Supabase Auth
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Extract first name from full name
      const firstName = name ? name.split(' ')[0] : email.split('@')[0];
      const lastName = name ? name.split(' ').slice(1).join(' ') || null : null;

      // Create user with Supabase Auth (with timeout)
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.admin.createUser({
          email,
          email_confirm: true, // Auto-confirm for development
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
          },
        }),
        10000 // 10 second timeout
      );

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      // Store user in our database
      await storage.upsertUser({
        id: authData.user.id,
        email: authData.user.email!,
        firstName,
        lastName,
        profileImageUrl: null,
      });

      res.json({ 
        user: authData.user,
        message: "User created successfully" 
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // For development, we'll create a session token (with timeout)
      const { data: users, error: userError } = await withTimeout(
        supabase.auth.admin.listUsers(),
        10000 // 10 second timeout
      );
      
      if (userError) {
        return res.status(500).json({ error: "Failed to fetch users" });
      }
      
      const userData = users.users.find(user => user.email === email);
      if (!userData) {
        return res.status(404).json({ error: "User not found" });
      }

      // Ensure user exists in our database
      await storage.upsertUser({
        id: userData.id,
        email: userData.email!,
        firstName: userData.user_metadata?.first_name || null,
        lastName: userData.user_metadata?.last_name || null,
        profileImageUrl: userData.user_metadata?.avatar_url || null,
      });

      res.json({ 
        user: userData,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Simple login for development (creates user if doesn't exist)
  app.get("/api/login", async (req, res) => {
    try {
      const email = req.query.email as string || "user@cleanslater.com";
      const name = req.query.name as string || "";
      
      const firstName = name ? name.split(' ')[0] : email.split('@')[0];
      const lastName = name ? name.split(' ').slice(1).join(' ') || null : null;

      // Check if user exists (with timeout)
      const { data: users } = await withTimeout(
        supabase.auth.admin.listUsers(),
        10000 // 10 second timeout
      );
      const existingUser = users?.users.find(user => user.email === email);
      
      let userId: string;
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user (with timeout)
        const { data: newUser, error } = await withTimeout(
          supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
            },
          }),
          10000 // 10 second timeout
        );
        
        if (error) {
          throw error;
        }
        
        userId = newUser.user.id;
      }

      // Store/update user in our database
      await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        profileImageUrl: null,
      });

      // Set a simple session cookie for development
      res.cookie('supabase_user_id', userId, {
        httpOnly: true,
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: 'lax',
      });

      res.redirect('/');
    } catch (error) {
      console.error("Simple login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST login endpoint (for form submissions)
  app.post("/api/login", async (req, res) => {
    try {
      const { email, name } = req.body;
      const userEmail = email || "user@cleanslater.com";
      const fullName = name || "";
      
      const firstName = fullName ? fullName.split(' ')[0] : userEmail.split('@')[0];
      const lastName = fullName ? fullName.split(' ').slice(1).join(' ') || null : null;

      // Check if user exists (with timeout)
      const { data: users } = await withTimeout(
        supabase.auth.admin.listUsers(),
        10000 // 10 second timeout
      );
      const existingUser = users?.users.find(user => user.email === userEmail);
      
      let userId: string;
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user (with timeout)
        const { data: newUser, error } = await withTimeout(
          supabase.auth.admin.createUser({
            email: userEmail,
            email_confirm: true,
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
            },
          }),
          10000 // 10 second timeout
        );
        
        if (error) {
          throw error;
        }
        
        userId = newUser.user.id;
      }

      // Store/update user in our database
      await storage.upsertUser({
        id: userId,
        email: userEmail,
        firstName,
        lastName,
        profileImageUrl: null,
      });

      // Set a simple session cookie
      res.cookie('supabase_user_id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: 'lax',
      });

      res.json({ 
        success: true, 
        user: { id: userId, email: userEmail, firstName, lastName },
        message: "Login successful" 
      });
    } catch (error) {
      console.error("POST login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.cookies?.supabase_user_id;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get user from our database
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    res.clearCookie('supabase_user_id');
    res.json({ message: "Logged out successfully" });
  });

  // Admin endpoint to list all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Get all users from Supabase
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        throw error;
      }

      res.json(users);
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
} 