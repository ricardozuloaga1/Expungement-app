// Direct login endpoint for Vercel
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req, res) {
  try {
    // Handle both POST (from form) and GET (fallback) requests
    let email, name;
    
    if (req.method === 'POST') {
      // Real user data from the signup/login form
      email = req.body.email;
      name = req.body.name || "";
    } else {
      // GET request fallback (for testing)
      email = req.query.email || "demo@expungement-app.com";
      name = req.query.name || "Demo User";
    }
    
    // Validate email is provided
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const firstName = name ? name.split(' ')[0] : email.split('@')[0];
    const lastName = name ? name.split(' ').slice(1).join(' ') || null : null;

    // Check if user exists in our users table first (more reliable)
    const { data: existingDbUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();
    
    let userId;
    
    if (existingDbUser && !fetchError) {
      // User exists, log them in
      userId = existingDbUser.id;
      console.log('Existing user found:', email, userId);
    } else {
      // Check auth users as backup
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = authUsers?.users.find(user => user.email === email);
      
      if (existingAuthUser) {
        userId = existingAuthUser.id;
        console.log('Existing auth user found:', email, userId);
      } else {
        // Create completely new user
        const { data: newUser, error } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
          },
        });
        
        if (error) {
          // If user already exists error, try to get the existing user
          if (error.message.includes('already exists') || error.message.includes('already registered')) {
            return res.status(400).json({ 
              error: "Account already exists", 
              message: "An account with this email already exists. Please contact support if you need help accessing your account." 
            });
          }
          throw error;
        }
        
        userId = newUser.user.id;
        console.log('New user created:', email, userId);
      }
    }

    // Store user in database using direct Supabase client
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        profile_image_url: null,
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    }

    // Set session cookie
    res.setHeader('Set-Cookie', `supabase_user_id=${userId}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
    
    // Redirect to home
    res.redirect(302, '/');
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed", message: error.message });
  }
} 