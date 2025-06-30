// Simple debug endpoint for Vercel troubleshooting
export default async function handler(req, res) {
  try {
    // Basic environment check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL: process.env.VERCEL || 'not set',
      DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'MISSING',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'configured' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'MISSING',
    };

    // Test database connection
    let dbStatus = 'not tested';
    let actualConnectionString = 'unknown';
    try {
      // Log the actual DATABASE_URL being used (redacted for security)
      const rawUrl = process.env.DATABASE_URL || '';
      actualConnectionString = rawUrl.replace(/:([^:@]+)@/, ':***@'); // Hide password
      
      // Try Supabase client first (more reliable for serverless)
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: { persistSession: false }
        }
      );
      
      // Test with Supabase client
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        throw new Error(`Supabase client error: ${error.message}`);
      }
      dbStatus = 'connected successfully with Supabase client';
      
    } catch (supabaseError) {
      // Fallback to raw Drizzle connection
      try {
        const { db } = await import('../dist/server/db.js');
        await db.execute('SELECT 1');
        dbStatus = 'connected with Drizzle (Supabase client failed)';
      } catch (drizzleError) {
        dbStatus = `both connections failed - Supabase: ${supabaseError.message}, Drizzle: ${drizzleError.message}`;
      }
    }

    res.status(200).json({
      message: 'Vercel Debug Endpoint',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
      connectionString: actualConnectionString,
      request: {
        method: req.method,
        url: req.url,
        headers: Object.keys(req.headers),
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
} 