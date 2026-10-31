const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a JWT token containing user identity and role
 * @param {object} payload - { id, email, role, institutionId }
 * @returns {string}
 */
function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token 
 * @returns {object} Decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  generateToken,
  verifyToken,
};
