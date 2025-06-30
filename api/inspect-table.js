// Table structure inspector
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
    // Get table structure by trying to insert empty data and seeing what columns are expected
    const { data, error } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .limit(1);

    if (error) {
      return res.json({
        message: 'Table inspection',
        timestamp: new Date().toISOString(),
        error: error.message,
        status: 'error'
      });
    }

    // Try to describe the table structure
    const sampleRow = data?.[0] || {};
    
    return res.json({
      message: 'Table inspection',
      timestamp: new Date().toISOString(),
      rowCount: data?.length || 0,
      columns: Object.keys(sampleRow),
      sampleData: sampleRow,
      status: 'success'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Inspection error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 