// Direct endpoint to get user's questionnaire responses
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
    // Get user ID from cookie
    const userId = req.cookies?.supabase_user_id;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Get user's questionnaire responses
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch questionnaire responses' });
    }

    return res.json(data);
  } catch (error) {
    console.error("Get questionnaire responses error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
} 