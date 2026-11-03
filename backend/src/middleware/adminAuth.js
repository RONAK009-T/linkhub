const { authenticate } = require('./auth');

function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Admin access required for this action.' });
  });
}

module.exports = {
  requireAdmin
};
