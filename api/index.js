// Vercel API handler for all Express routes
export default async function handler(req, res) {
  try {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Import the app dynamically to handle any initialization issues
    const { default: app } = await import('../dist/server/index.js');
    
    // Call the app handler
    return await app(req, res);
    
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 