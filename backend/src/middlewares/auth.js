const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_for_exercise';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next({ status: 401, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized: Invalid token' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next({ status: 403, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize, JWT_SECRET };
