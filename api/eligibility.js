// Direct eligibility endpoint for Vercel
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

// Simplified eligibility logic (you can import from your server/routes.ts later)
function determineEligibility(responses) {
  // Basic eligibility check - you can expand this
  return {
    automaticExpungement: false,
    automaticSealing: false, 
    petitionBasedSealing: true,
    eligibilityDetails: {
      primaryReason: "Potentially eligible for petition-based sealing",
      explanation: "Based on your responses, you may be eligible for record sealing through a court petition."
    },
    recommendations: [
      {
        type: "petition",
        title: "File Court Petition",
        description: "Consider filing a petition for record sealing with the appropriate court.",
        timeline: "6-12 months"
      }
    ]
  };
}

export default async function handler(req, res) {
  try {
    // Get user ID from cookie
    const userId = req.cookies?.supabase_user_id;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.method === 'POST') {
      // Create eligibility result
      const { questionnaireResponseId, ...otherData } = req.body;

      // Get the questionnaire response
      const { data: questionnaireResponse, error: fetchError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('id', questionnaireResponseId)
        .eq('userId', userId)
        .single();

      if (fetchError || !questionnaireResponse) {
        return res.status(404).json({ error: "Questionnaire response not found" });
      }

      // Calculate eligibility
      const eligibility = determineEligibility(questionnaireResponse);

      // Store eligibility result
      const eligibilityData = {
        userId,
        questionnaireResponseId,
        ...eligibility,
        createdAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('eligibility_results')
        .insert(eligibilityData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to create eligibility result' });
      }

      return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error("Eligibility error:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
} 