const express = require('express');
const {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
} = require('../controllers/evaluation.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Create evaluation: Mentor or Admin
router.post('/', authorizeRoles('MENTOR', 'INSTITUTION_ADMIN'), createEvaluation);

// List evaluations: scoped by role
router.get('/', getEvaluations);

// Single evaluation
router.get('/:id', getEvaluationById);

module.exports = router;
