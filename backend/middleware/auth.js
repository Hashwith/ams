const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    // Temporary: Accept hardcoded token
    if (token === 'hardcoded-admin-token') {
      req.user = { id: 'admin-id', role: 'admin', username: 'admin' };
      return next();
    }
    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};