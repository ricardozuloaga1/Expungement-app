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
    
    // Simple API response for now
    if (req.url.startsWith('/api/')) {
      res.status(200).json({ 
        message: 'API is working',
        path: req.url,
        method: req.method
      });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 