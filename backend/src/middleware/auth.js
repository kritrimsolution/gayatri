const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gayatri_pharma_jwt_secret_secure_key_12345!';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing. Access denied.' });
  }

  const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ error: 'Token is missing. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.admin = decoded; // Backwards compatibility for existing Phase 1 endpoints
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
}

function requireClient(req, res, next) {
  if (!req.user || req.user.role !== 'client') {
    return res.status(403).json({ error: 'Access forbidden. Client portal privileges required.' });
  }
  next();
}

module.exports = {
  authMiddleware,
  requireAdmin,
  requireClient
};
