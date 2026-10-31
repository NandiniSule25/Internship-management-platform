const express = require('express');
const {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
} = require('../controllers/internship.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Create cohort: Admin or Mentor
router.post('/', authorizeRoles('INSTITUTION_ADMIN', 'MENTOR'), createInternship);

// List cohorts: scoped by role
router.get('/', getInternships);

// Single cohort details
router.get('/:id', getInternshipById);

// Update cohort details: Admin or Assigned Mentor
router.put('/:id', authorizeRoles('INSTITUTION_ADMIN', 'MENTOR'), updateInternship);

// Update status: Admin or Assigned Mentor
router.patch('/:id/status', authorizeRoles('INSTITUTION_ADMIN', 'MENTOR'), updateInternshipStatus);

module.exports = router;
