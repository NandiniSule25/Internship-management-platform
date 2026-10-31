const express = require('express');
const {
  downloadInternReport,
  downloadInstitutionReport,
} = require('../controllers/report.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Intern performance PDF report
router.get('/intern/:internshipId/pdf', downloadInternReport);

// Institution executive summary audit PDF
router.get('/institution/:id/summary-pdf', authorizeRoles('INSTITUTION_ADMIN'), downloadInstitutionReport);

module.exports = router;
