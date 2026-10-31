const { prisma } = require('../config/db');

/**
 * Create a new task and allocate it to an intern
 * @route POST /api/tasks
 * @access Private (Mentor, Institution Admin)
 */
async function createTask(req, res) {
  try {
    const { title, description, priority, deadline, internshipId, assigneeId } = req.body;
    const { id: creatorId, institutionId, role } = req.user;

    // Validation
    if (!title || !deadline || !internshipId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title, deadline, and internship cohort ID are required.',
      });
    }

    const taskDeadline = new Date(deadline);
    if (isNaN(taskDeadline.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid deadline date format.',
      });
    }

    // Verify internship exists and belongs to this institution
    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: { mentor: true, intern: true },
    });

    if (!internship || internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Internship cohort not found in your institution.',
      });
    }

    // Role check: Mentors can only create tasks for cohorts they mentor
    if (role === 'MENTOR' && internship.mentorId !== creatorId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only assign tasks to internships you mentor.',
      });
    }

    // Determine assignee
    const targetAssigneeId = assigneeId || internship.internId;
    if (!targetAssigneeId) {
      return res.status(400).json({
        status: 'fail',
        message: 'No intern assigned to this cohort. Please assign an intern first.',
      });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        priority: priority || 'MEDIUM',
        status: 'TODO',
        deadline: taskDeadline,
        internshipId,
        creatorId,
        assigneeId: targetAssigneeId,
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true } },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Task allocated successfully.',
      task,
    });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to allocate task.',
      error: error.message,
    });
  }
}

/**
 * List tasks scoped by role, cohort, and status
 * @route GET /api/tasks
 * @access Private
 */
async function getTasks(req, res) {
  try {
    const { internshipId, status, priority, assigneeId } = req.query;
    const { id: userId, role, institutionId } = req.user;

    const where = {
      internship: {
        institutionId,
      },
      ...(internshipId && { internshipId }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
    };

    // Role-based restrictions
    if (role === 'INTERN') {
      where.assigneeId = userId;
    } else if (role === 'MENTOR' && !internshipId) {
      where.OR = [
        { creatorId: userId },
        { internship: { mentorId: userId } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true } },
        _count: { select: { progressUpdates: true } },
      },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    });

    return res.status(200).json({
      status: 'success',
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('getTasks error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve tasks.',
      error: error.message,
    });
  }
}

/**
 * Get single task details with progress update timeline
 * @route GET /api/tasks/:id
 * @access Private
 */
async function getTaskById(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role, institutionId } = req.user;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true, institutionId: true, mentorId: true } },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
          include: {
            intern: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!task || task.internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      });
    }

    // Role authorization
    if (role === 'INTERN' && task.assigneeId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only view tasks assigned to you.',
      });
    }

    return res.status(200).json({
      status: 'success',
      task,
    });
  } catch (error) {
    console.error('getTaskById error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve task.',
      error: error.message,
    });
  }
}

/**
 * Update task status (TODO -> IN_PROGRESS -> UNDER_REVIEW -> COMPLETED)
 * @route PATCH /api/tasks/:id/status
 * @access Private (Assignee Intern, Creator Mentor, Admin)
 */
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { id: userId, role, institutionId } = req.user;

    const validStatuses = ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { internship: true },
    });

    if (!task || task.internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      });
    }

    // Authorization: only the assigned intern, cohort mentor, or admin can change status
    const isAssignee = task.assigneeId === userId;
    const isMentor = task.internship.mentorId === userId;
    const isAdmin = role === 'INSTITUTION_ADMIN';

    if (!isAssignee && !isMentor && !isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You are not authorized to update this task.',
      });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        creator: { select: { firstName: true, lastName: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: `Task status updated to ${status}.`,
      task: updated,
    });
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update task status.',
      error: error.message,
    });
  }
}

/**
 * Submit a daily progress update with notes, work URL, and hours spent
 * @route POST /api/tasks/:id/progress
 * @access Private (Assignee Intern)
 */
async function submitProgressUpdate(req, res) {
  try {
    const { id: taskId } = req.params;
    const { updateNote, workUrl, hoursSpent, statusAtUpdate } = req.body;
    const { id: internId, institutionId } = req.user;

    if (!updateNote || typeof updateNote !== 'string' || updateNote.trim().length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Update note describing your work is required.',
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { internship: true },
    });

    if (!task || task.internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Task not found.',
      });
    }

    // Verify user is the assigned intern
    if (task.assigneeId !== internId && req.user.role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: Only the assigned intern can log progress updates for this task.',
      });
    }

    const effectiveStatus = statusAtUpdate || task.status;

    // Create progress update and optionally update task status in a transaction
    const [progressUpdate, updatedTask] = await prisma.$transaction([
      prisma.progressUpdate.create({
        data: {
          taskId,
          internId,
          updateNote: updateNote.trim(),
          workUrl: workUrl ? workUrl.trim() : null,
          hoursSpent: hoursSpent ? parseFloat(hoursSpent) : null,
          statusAtUpdate: effectiveStatus,
        },
        include: {
          intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: effectiveStatus },
      }),
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Progress update logged successfully.',
      progressUpdate,
      currentTaskStatus: updatedTask.status,
    });
  } catch (error) {
    console.error('submitProgressUpdate error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit progress update.',
      error: error.message,
    });
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  submitProgressUpdate,
};
