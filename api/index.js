// Import the built Express app
let appModule;

async function getApp() {
  if (!appModule) {
    // Import the built server
    appModule = await import('../dist/index.js');
  }
  return appModule.default;
}

export default async function handler(req, res) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    const app = await getApp();
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 