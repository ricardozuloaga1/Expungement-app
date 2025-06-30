// Simple error viewer for debugging
let recentErrors = [];

export function logError(source, error, data = null) {
  const errorEntry = {
    timestamp: new Date().toISOString(),
    source,
    error: error.message || error,
    details: error.details || null,
    code: error.code || null,
    hint: error.hint || null,
    data: data ? JSON.stringify(data).substring(0, 500) : null
  };
  
  recentErrors.unshift(errorEntry);
  // Keep only last 50 errors
  if (recentErrors.length > 50) {
    recentErrors = recentErrors.slice(0, 50);
  }
  
  console.log(`[${source}]`, error);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.json({
      message: 'Recent function errors',
      timestamp: new Date().toISOString(),
      errors: recentErrors
    });
  }
  
  if (req.method === 'DELETE') {
    recentErrors = [];
    return res.json({ message: 'Errors cleared' });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
} 