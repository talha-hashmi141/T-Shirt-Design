const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Remove Bearer if present
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded.id;
      next();
    } catch (err) {
      console.error('Token verification error:', err);
      
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;
