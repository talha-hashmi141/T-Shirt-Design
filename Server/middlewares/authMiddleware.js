const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Remove 'Bearer ' if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;

    const verified = jwt.verify(tokenString, JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
