// Dynamic endpoint for updating specific questionnaire responses
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

    const { id } = req.query;

    if (req.method === 'PUT') {
      // Update existing questionnaire response
      const questionnaireData = {
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .update(questionnaireData)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to update questionnaire response' });
      }

      return res.json(data);
    }

    if (req.method === 'GET') {
      // Get specific questionnaire response
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('id', id)
        .eq('userId', userId)
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch questionnaire response' });
      }

      return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Questionnaire update error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
} 