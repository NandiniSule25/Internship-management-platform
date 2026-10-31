const express = require('express');
const {
  getInstitutionMetrics,
  getInstitutionUsers,
} = require('../controllers/institution.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

// Require authentication for all institution routes
router.use(authenticateToken);

// Metrics endpoint - restricted to Admin
router.get('/:id/metrics', authorizeRoles('INSTITUTION_ADMIN'), getInstitutionMetrics);

// Users list (mentors and interns) - accessible to Admin and Mentor
router.get('/:id/users', authorizeRoles('INSTITUTION_ADMIN', 'MENTOR'), getInstitutionUsers);

module.exports = router;
