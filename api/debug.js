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
    try {
      // Try importing the database module
      const { db } = await import('../dist/server/db.js');
      
      // Simple query test
      const result = await db.select().from(db.users).limit(1);
      dbStatus = 'connected successfully';
    } catch (error) {
      dbStatus = `connection failed: ${error.message}`;
    }

    res.status(200).json({
      message: 'Vercel Debug Endpoint',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
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