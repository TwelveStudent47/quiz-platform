// middleware/globalApiAuth.js

/**
 * Global API Protection Middleware
 * Requires X-API-Key header to match server secret
 * Use this to protect your entire API from unauthorized access
 */

function requireApiKey(req, res, next) {
  // Skip auth check for these paths
  const publicPaths = [
    '/auth/google',
    '/auth/google/callback',
    '/auth/logout'
  ];

  if (publicPaths.includes(req.path)) {
    return next();
  }

  // Get API key from header
  const apiKey = req.headers['x-api-key'];

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required. Include X-API-Key header.'
    });
  }

  // Validate API key against server secret
  const validApiKey = process.env.API_SECRET_KEY;

  if (!validApiKey) {
    console.error('⚠️ API_SECRET_KEY not configured in .env!');
    return res.status(500).json({
      error: 'Server Configuration Error',
      message: 'API key validation is not properly configured'
    });
  }

  if (apiKey !== validApiKey) {
    console.warn('🚫 Invalid API key attempt:', {
      ip: req.ip,
      path: req.path,
      providedKey: apiKey.substring(0, 10) + '...'
    });

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid API key'
    });
  }

  next();
}

module.exports = { requireApiKey };