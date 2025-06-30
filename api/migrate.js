// Database migration endpoint to add missing columns
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

const migrations = [
  // Add missing columns to questionnaire_responses table
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS conviction_state VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS has_marijuana_conviction VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS offense_types JSONB`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS conviction_month VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS conviction_year VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS knows_penal_code VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS penal_code VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS possession_amount VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS age_at_offense VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS received_notice VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS conviction_level VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS served_time VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS release_month VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS release_year VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS other_convictions VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS on_supervision VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS has_excluded_offenses VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS total_convictions VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS total_felonies VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS sentence_completed VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS has_records VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS wants_rap_assistance VARCHAR(255)`,
  `ALTER TABLE questionnaire_responses ADD COLUMN IF NOT EXISTS uploaded_document VARCHAR(255)`,
];

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const results = [];
    
    for (const migration of migrations) {
      try {
        const { data, error } = await supabase.rpc('execute_sql', { sql: migration });
        
        if (error) {
          // Try direct execution if RPC doesn't work
          const { data: directData, error: directError } = await supabase
            .from('_dummy')
            .select('*')
            .limit(0); // This will fail but might give us direct access
          
          results.push({
            sql: migration.substring(0, 100) + '...',
            status: 'error',
            error: error.message
          });
        } else {
          results.push({
            sql: migration.substring(0, 100) + '...',
            status: 'success'
          });
        }
      } catch (e) {
        results.push({
          sql: migration.substring(0, 100) + '...',
          status: 'error',
          error: e.message
        });
      }
    }

    res.json({
      message: 'Migration attempted',
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    res.status(500).json({
      error: 'Migration error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 