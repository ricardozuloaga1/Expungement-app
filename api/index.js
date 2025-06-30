// Single Vercel API handler for all Express routes
module.exports = async function handler(req, res) {
  try {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Import the Express app handler using CommonJS require
    const appHandler = require('../dist/server/index.js').default || require('../dist/server/index.js');
    
    // Ensure the handler is properly called
    if (typeof appHandler === 'function') {
      return await appHandler(req, res);
    } else {
      console.error('App handler type:', typeof appHandler);
      console.error('App handler keys:', Object.keys(appHandler || {}));
      throw new Error(`App handler is not a function. Type: ${typeof appHandler}`);
    }
    
  } catch (error) {
    console.error('API handler error:', error);
    
    // Return detailed error information for debugging
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}; 