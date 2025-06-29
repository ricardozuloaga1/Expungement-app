// Vercel serverless function handler for Express app
let appInstance = null;

async function getApp() {
  if (!appInstance) {
    try {
      // Import the built server module
      const serverModule = await import('../dist/index.js');
      appInstance = serverModule.default;
      
      // Ensure the app is properly initialized
      if (typeof appInstance === 'function') {
        // App is likely the Express function, ready to use
        console.log('✅ Express app loaded successfully for Vercel');
      } else {
        throw new Error('Invalid app export structure');
      }
    } catch (error) {
      console.error('❌ Failed to load Express app:', error);
      throw error;
    }
  }
  return appInstance;
}

export default async function handler(req, res) {
  try {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Get the Express app instance
    const app = await getApp();
    
    // Handle the request with Express
    return app(req, res);
    
  } catch (error) {
    console.error('🚨 Vercel function error:', error);
    
    // Return detailed error for debugging
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
} 