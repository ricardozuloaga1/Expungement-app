// Vercel serverless function handler for Express app
let appInstance = null;

async function getApp() {
  if (!appInstance) {
    try {
      // Import the built server module
      const serverModule = await import('../dist/server/index.js');
      
      // The built server exports an initialized Express app
      appInstance = serverModule.default;
      
      console.log('✅ Express app loaded successfully for Vercel');
    } catch (error) {
      console.error('❌ Failed to load Express app:', error);
      
      // Debug: Check what files are available
      try {
        const fs = await import('fs');
        console.log('📁 Current working directory:', process.cwd());
        console.log('📁 Available files in current dir:', fs.readdirSync('.'));
        
        if (fs.existsSync('dist')) {
          console.log('📁 Files in dist:', fs.readdirSync('dist'));
          console.log('📁 Files in dist/server:', fs.readdirSync('dist/server'));
        } else {
          console.log('❌ dist directory does not exist');
        }
        
        if (fs.existsSync('../dist')) {
          console.log('📁 Files in ../dist:', fs.readdirSync('../dist'));
          if (fs.existsSync('../dist/server')) {
            console.log('📁 Files in ../dist/server:', fs.readdirSync('../dist/server'));
          }
        } else {
          console.log('❌ ../dist directory does not exist');
        }
      } catch (debugError) {
        console.log('Debug failed:', debugError.message);
      }
      
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