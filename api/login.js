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
    const email = req.query.email || "user@cleanslater.com";
    const name = req.query.name || "";
    
    const firstName = name ? name.split(' ')[0] : email.split('@')[0];
    const lastName = name ? name.split(' ').slice(1).join(' ') || null : null;

    // Check if user exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users.find(user => user.email === email);
    
    let userId;
    
    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      
      if (error) {
        throw error;
      }
      
      userId = newUser.user.id;
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