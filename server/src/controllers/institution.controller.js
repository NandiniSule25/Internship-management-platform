const { prisma } = require('../config/db');

/**
 * Get comprehensive analytics and metrics for an institution
 * @route GET /api/institutions/:id/metrics
 * @access Private (Institution Admin)
 */
async function getInstitutionMetrics(req, res) {
  try {
    let institutionId = req.params.id;
    if (!institutionId || institutionId === 'me') {
      institutionId = req.user.institutionId;
    }

    // Security check: ensure user belongs to this institution
    if (req.user.institutionId !== institutionId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only access metrics for your affiliated institution.',
      });
    }

    // Parallel aggregate queries
    const [
      institution,
      cohortCounts,
      userCounts,
      tasksAggregate,
      evaluationsAggregate,
      recentCohorts,
    ] = await Promise.all([
      // 1. Institution details
      prisma.institution.findUnique({
        where: { id: institutionId },
      }),

      // 2. Cohort counts by status
      prisma.internship.groupBy({
        by: ['status'],
        where: { institutionId },
        _count: { status: true },
      }),

      // 3. User counts by role
      prisma.user.groupBy({
        by: ['role'],
        where: { institutionId, isActive: true },
        _count: { role: true },
      }),

      // 4. Tasks across all institution internships
      prisma.task.groupBy({
        by: ['status'],
        where: { internship: { institutionId } },
        _count: { status: true },
      }),

      // 5. Overall evaluations average
      prisma.evaluation.aggregate({
        where: { internship: { institutionId } },
        _avg: {
          overallScore: true,
          technicalScore: true,
          communicationScore: true,
          punctualityScore: true,
        },
        _count: { id: true },
      }),

      // 6. Recent 5 internships
      prisma.internship.findMany({
        where: { institutionId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
          intern: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { tasks: true, evaluations: true } },
        },
      }),
    ]);

    if (!institution) {
      return res.status(404).json({
        status: 'fail',
        message: 'Institution not found.',
      });
    }

    // Format cohort statistics
    const cohortsSummary = {
      total: 0,
      PENDING: 0,
      ACTIVE: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    cohortCounts.forEach((c) => {
      cohortsSummary[c.status] = c._count.status;
      cohortsSummary.total += c._count.status;
    });

    // Format user counts
    const usersSummary = {
      total: 0,
      INSTITUTION_ADMIN: 0,
      MENTOR: 0,
      INTERN: 0,
    };
    userCounts.forEach((u) => {
      usersSummary[u.role] = u._count.role;
      usersSummary.total += u._count.role;
    });

    // Format task counts
    const tasksSummary = {
      total: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      UNDER_REVIEW: 0,
      COMPLETED: 0,
    };
    tasksAggregate.forEach((t) => {
      tasksSummary[t.status] = t._count.status;
      tasksSummary.total += t._count.status;
    });

    return res.status(200).json({
      status: 'success',
      data: {
        institution: {
          id: institution.id,
          name: institution.name,
          code: institution.code,
          contactEmail: institution.contactEmail,
          website: institution.website,
        },
        cohorts: cohortsSummary,
        users: usersSummary,
        tasks: tasksSummary,
        evaluations: {
          totalCount: evaluationsAggregate._count.id,
          avgOverall: evaluationsAggregate._avg.overallScore ? Number(evaluationsAggregate._avg.overallScore.toFixed(2)) : 0,
          avgTechnical: evaluationsAggregate._avg.technicalScore ? Number(evaluationsAggregate._avg.technicalScore.toFixed(2)) : 0,
          avgCommunication: evaluationsAggregate._avg.communicationScore ? Number(evaluationsAggregate._avg.communicationScore.toFixed(2)) : 0,
          avgPunctuality: evaluationsAggregate._avg.punctualityScore ? Number(evaluationsAggregate._avg.punctualityScore.toFixed(2)) : 0,
        },
        recentCohorts,
      },
    });
  } catch (error) {
    console.error('getInstitutionMetrics error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve institution metrics.',
      error: error.message,
    });
  }
}

/**
 * List all users (mentors and interns) in this institution
 * @route GET /api/institutions/:id/users
 * @access Private (Institution Admin, Mentor)
 */
async function getInstitutionUsers(req, res) {
  try {
    let institutionId = req.params.id;
    if (!institutionId || institutionId === 'me') {
      institutionId = req.user.institutionId;
    }
    const { role } = req.query;

    if (req.user.institutionId !== institutionId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only query users within your own institution.',
      });
    }

    const where = {
      institutionId,
      isActive: true,
      ...(role && { role }),
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            mentoredInternships: true,
            internships: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });

    return res.status(200).json({
      status: 'success',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('getInstitutionUsers error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve institution users.',
      error: error.message,
    });
  }
}

module.exports = {
  getInstitutionMetrics,
  getInstitutionUsers,
};
