// Netlify Functions API handler for all Express routes
exports.handler = async (event, context) => {
  try {
    // Debug environment variables
    console.log('🔍 Environment Variables Debug:');
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('JWT') || key.includes('NODE')));
    
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Test endpoint to check environment variables
    if (event.path === '/api/test-env') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
          JWT_SECRET: !!process.env.JWT_SECRET,
          NODE_ENV: process.env.NODE_ENV,
          allEnvVars: Object.keys(process.env).filter(key => 
            key.includes('OPENAI') || key.includes('JWT') || key.includes('NODE')
          )
        })
      };
    }

    // Import the Express app handler - the compiled CommonJS has exports.default
    const serverModule = require('../../dist/server/index.js');
    const appHandler = serverModule.default;
    
    // Ensure the handler is properly called
    if (typeof appHandler === 'function') {
      // Convert Netlify event to Express-like request/response
      const req = {
        method: event.httpMethod,
        url: event.path,
        headers: event.headers,
        body: event.body,
        query: event.queryStringParameters || {},
        cookies: event.headers.cookie ? parseCookies(event.headers.cookie) : {}
      };
      
      const res = {
        statusCode: 200,
        headers: {},
        body: '',
        setHeader: (name, value) => {
          res.headers[name] = value;
        },
        json: (data) => {
          res.body = JSON.stringify(data);
          res.headers['Content-Type'] = 'application/json';
        },
        status: (code) => {
          res.statusCode = code;
          return res;
        },
        end: (data) => {
          if (data) res.body = data;
        }
      };
      
      await appHandler(req, res);
      
      return {
        statusCode: res.statusCode,
        headers: { ...headers, ...res.headers },
        body: res.body
      };
    } else {
      console.error('Server module:', serverModule);
      console.error('App handler type:', typeof appHandler);
      console.error('Available exports:', Object.keys(serverModule));
      throw new Error(`App handler is not a function. Type: ${typeof appHandler}`);
    }
    
  } catch (error) {
    console.error('API handler error:', error);
    
    // Return detailed error information for debugging
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Helper function to parse cookies
function parseCookies(cookieString) {
  const cookies = {};
  if (cookieString) {
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
  }
  return cookies;
}
