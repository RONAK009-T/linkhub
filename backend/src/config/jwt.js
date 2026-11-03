const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'linkhub-production-jwt-super-secret-key-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      display_name: user.display_name,
      avatar_url: user.avatar_url
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken
};
