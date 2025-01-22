const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
  next();
};

module.exports = authMiddleware;
