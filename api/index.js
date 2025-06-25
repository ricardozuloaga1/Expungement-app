export default async function handler(req, res) {
  // Import the built server
  const { default: app } = await import('../dist/index.js');
  
  // Handle the request
  return app(req, res);
} 