const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header and clean it
    let token = req.header('Authorization');
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Remove Bearer if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verify token
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified.id;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;
