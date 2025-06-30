// Test authentication endpoint
export default async function handler(req, res) {
  try {
    // Check all cookies
    const cookies = req.cookies || {};
    const userId = cookies.supabase_user_id;
    
    return res.json({
      message: 'Authentication test',
      timestamp: new Date().toISOString(),
      cookies: Object.keys(cookies),
      userId: userId || 'NOT FOUND',
      hasAuth: !!userId,
      request: {
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']?.substring(0, 100)
      }
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Test auth error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 