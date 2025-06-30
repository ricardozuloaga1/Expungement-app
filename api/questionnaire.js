// Direct questionnaire endpoint for Vercel
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
    
    console.log('Request cookies:', Object.keys(req.cookies || {}));
    console.log('User ID from cookie:', userId);
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.method === 'POST') {
      // Create new questionnaire response
      const questionnaireData = {
        ...req.body,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('questionnaire_responses')
        .insert(questionnaireData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Failed data:', JSON.stringify(questionnaireData, null, 2));
        return res.status(500).json({ 
          error: 'Failed to create questionnaire response', 
          details: error.message,
          code: error.code,
          hint: error.hint 
        });
      }

      return res.json(data);
    }

    if (req.method === 'PUT') {
      // Update existing questionnaire response
      const { id, ...updateData } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Questionnaire ID is required for updates' });
      }

      const questionnaireData = {
        ...updateData,
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
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Questionnaire error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
} 