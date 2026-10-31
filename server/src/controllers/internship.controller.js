const { prisma } = require('../config/db');

/**
 * Create a new internship cohort
 * @route POST /api/internships
 * @access Private (Institution Admin, Mentor)
 */
async function createInternship(req, res) {
  try {
    const {
      title,
      description,
      department,
      startDate,
      endDate,
      mentorId,
      internId,
      status,
    } = req.body;

    const institutionId = req.user.institutionId;

    // Validation
    if (!title || !department || !startDate || !endDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title, department, start date, and end date are required.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid start date or end date format.',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        status: 'fail',
        message: 'End date must be after start date.',
      });
    }

    // If mentorId provided, verify they are in this institution
    if (mentorId) {
      const mentor = await prisma.user.findFirst({
        where: { id: mentorId, institutionId, role: 'MENTOR' },
      });
      if (!mentor) {
        return res.status(400).json({
          status: 'fail',
          message: 'Selected mentor is invalid or does not belong to your institution.',
        });
      }
    }

    // If internId provided, verify they are in this institution
    if (internId) {
      const intern = await prisma.user.findFirst({
        where: { id: internId, institutionId, role: 'INTERN' },
      });
      if (!intern) {
        return res.status(400).json({
          status: 'fail',
          message: 'Selected intern is invalid or does not belong to your institution.',
        });
      }
    }

    // If created by a mentor who didn't specify mentorId, auto-assign themselves
    const effectiveMentorId = mentorId || (req.user.role === 'MENTOR' ? req.user.id : null);

    const internship = await prisma.internship.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : '',
        department: department.trim(),
        startDate: start,
        endDate: end,
        status: status || 'PENDING',
        institutionId,
        mentorId: effectiveMentorId,
        internId: internId || null,
      },
      include: {
        institution: { select: { id: true, name: true, code: true } },
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { tasks: true, evaluations: true } },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Internship cohort created successfully.',
      internship,
    });
  } catch (error) {
    console.error('createInternship error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create internship cohort.',
      error: error.message,
    });
  }
}

/**
 * Get internships scoped by user role and institution
 * @route GET /api/internships
 * @access Private (Admin, Mentor, Intern)
 */
async function getInternships(req, res) {
  try {
    const { status, department, search } = req.query;
    const { role, id: userId, institutionId } = req.user;

    const where = {
      institutionId,
      ...(status && { status }),
      ...(department && { department: { contains: department, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Role-based scoping
    if (role === 'MENTOR') {
      where.mentorId = userId;
    } else if (role === 'INTERN') {
      where.internId = userId;
    }

    const internships = await prisma.internship.findMany({
      where,
      include: {
        institution: { select: { id: true, name: true, code: true } },
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { tasks: true, evaluations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      count: internships.length,
      internships,
    });
  } catch (error) {
    console.error('getInternships error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve internships.',
      error: error.message,
    });
  }
}

/**
 * Get single internship cohort by ID
 * @route GET /api/internships/:id
 * @access Private
 */
async function getInternshipById(req, res) {
  try {
    const { id } = req.params;
    const { role, id: userId, institutionId } = req.user;

    const internship = await prisma.internship.findUnique({
      where: { id },
      include: {
        institution: true,
        mentor: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        tasks: {
          orderBy: { deadline: 'asc' },
          include: {
            creator: { select: { firstName: true, lastName: true } },
            _count: { select: { progressUpdates: true } },
          },
        },
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
          include: {
            mentor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!internship) {
      return res.status(404).json({
        status: 'fail',
        message: 'Internship cohort not found.',
      });
    }

    // Access authorization: user must belong to same institution
    if (internship.institutionId !== institutionId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: Access restricted to members of the affiliated institution.',
      });
    }

    // Mentors can only view if assigned (or if admin)
    if (role === 'MENTOR' && internship.mentorId !== userId && role !== 'INSTITUTION_ADMIN') {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You are not assigned to this internship.',
      });
    }

    // Interns can only view if assigned
    if (role === 'INTERN' && internship.internId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You are not enrolled in this internship.',
      });
    }

    return res.status(200).json({
      status: 'success',
      internship,
    });
  } catch (error) {
    console.error('getInternshipById error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve internship details.',
      error: error.message,
    });
  }
}

/**
 * Update cohort details or assign mentor/intern
 * @route PUT /api/internships/:id
 * @access Private (Institution Admin, Assigned Mentor)
 */
async function updateInternship(req, res) {
  try {
    const { id } = req.params;
    const { title, description, department, startDate, endDate, mentorId, internId } = req.body;
    const institutionId = req.user.institutionId;

    const existing = await prisma.internship.findUnique({ where: { id } });
    if (!existing || existing.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Internship cohort not found.',
      });
    }

    // Role check
    if (req.user.role === 'MENTOR' && existing.mentorId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: Only the assigned mentor or an institution admin can edit this cohort.',
      });
    }

    const updated = await prisma.internship.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(department && { department: department.trim() }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(mentorId !== undefined && { mentorId }),
        ...(internId !== undefined && { internId }),
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Internship updated successfully.',
      internship: updated,
    });
  } catch (error) {
    console.error('updateInternship error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update internship.',
      error: error.message,
    });
  }
}

/**
 * Update status of an internship cohort
 * @route PATCH /api/internships/:id/status
 * @access Private (Admin, Assigned Mentor)
 */
async function updateInternshipStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const existing = await prisma.internship.findUnique({ where: { id } });
    if (!existing || existing.institutionId !== req.user.institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Internship not found.',
      });
    }

    // Mentors can only change status of their own cohorts
    if (req.user.role === 'MENTOR' && existing.mentorId !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only update the status of internships you mentor.',
      });
    }

    const updated = await prisma.internship.update({
      where: { id },
      data: { status },
      include: {
        mentor: { select: { firstName: true, lastName: true } },
        intern: { select: { firstName: true, lastName: true } },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: `Internship status changed to ${status}.`,
      internship: updated,
    });
  } catch (error) {
    console.error('updateInternshipStatus error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update status.',
      error: error.message,
    });
  }
}

module.exports = {
  createInternship,
  getInternships,
  getInternshipById,
  updateInternship,
  updateInternshipStatus,
};
