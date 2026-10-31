const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  submitProgressUpdate,
} = require('../controllers/task.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

// Create task: Mentor or Admin
router.post('/', authorizeRoles('MENTOR', 'INSTITUTION_ADMIN'), createTask);

// List tasks: scoped by role & query filters
router.get('/', getTasks);

// Get single task with timeline
router.get('/:id', getTaskById);

// Update status
router.patch('/:id/status', updateTaskStatus);

// Submit progress update (Intern)
router.post('/:id/progress', authorizeRoles('INTERN', 'INSTITUTION_ADMIN'), submitProgressUpdate);

module.exports = router;
