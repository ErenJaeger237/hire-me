const jwt = require('jsonwebtoken');

const { User } = require('../models');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is not set.');

  jwt.verify(token, secret, async (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    
    try {
      const dbUser = await User.findByPk(decodedUser.id);
      if (!dbUser) {
        return res.status(401).json({ error: 'User no longer exists.' });
      }
      if (dbUser.is_banned) {
        return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
      }
      
      req.user = decodedUser;
      next();
    } catch (dbErr) {
      console.error('Auth middleware DB error:', dbErr);
      return res.status(500).json({ error: 'Internal server error during authentication.' });
    }
  });
}

module.exports = { authenticateToken };
