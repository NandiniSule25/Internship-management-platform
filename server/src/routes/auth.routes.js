const express = require('express');
const {
  register,
  login,
  getMe,
  getInstitutions,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation.middleware');
const {
  authenticateToken,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/institutions', getInstitutions);
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (JWT required)
router.get('/me', authenticateToken, getMe);

module.exports = router;
