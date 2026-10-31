const { prisma } = require('../config/db');
const {
  generateInternPerformancePDF,
  generateInstitutionSummaryPDF,
} = require('../services/pdf.service');

/**
 * Stream a generated PDF performance report for an intern
 * @route GET /api/reports/intern/:internshipId/pdf
 * @access Private
 */
async function downloadInternReport(req, res) {
  try {
    const { internshipId } = req.params;
    const { id: userId, role, institutionId } = req.user;

    const internship = await prisma.internship.findUnique({
      where: { id: internshipId },
      include: {
        institution: true,
        mentor: true,
        intern: true,
        tasks: {
          orderBy: { deadline: 'asc' },
        },
        evaluations: {
          orderBy: { evaluatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!internship || internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Internship cohort not found.',
      });
    }

    // Authorization
    if (role === 'INTERN' && internship.internId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only download reports for your own internships.',
      });
    }

    // Set PDF streaming headers
    const safeTitle = internship.title.replace(/[^a-zA-Z0-9]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Performance_Report_${safeTitle}.pdf"`);

    // Audit log
    await prisma.reportAudit.create({
      data: {
        type: 'INTERN_PERFORMANCE',
        title: `Performance Report: ${internship.title}`,
        institutionId,
        generatedById: userId,
      },
    });

    // Generate and stream PDF
    generateInternPerformancePDF(
      {
        internship,
        evaluation: internship.evaluations[0] || null,
        tasks: internship.tasks || [],
        intern: internship.intern,
        mentor: internship.mentor,
        institution: internship.institution,
      },
      res
    );
  } catch (error) {
    console.error('downloadInternReport error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate PDF report.',
        error: error.message,
      });
    }
  }
}

/**
 * Stream an institution summary PDF audit report
 * @route GET /api/reports/institution/:id/summary-pdf
 * @access Private (Institution Admin)
 */
async function downloadInstitutionReport(req, res) {
  try {
    const institutionId = req.params.id || req.user.institutionId;
    const { id: userId, institutionId: userInstId } = req.user;

    if (institutionId !== userInstId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only generate audit reports for your affiliated institution.',
      });
    }

    const [institution, cohorts, userCounts, evaluationsAggregate] = await Promise.all([
      prisma.institution.findUnique({ where: { id: institutionId } }),
      prisma.internship.findMany({
        where: { institutionId },
        include: { intern: true, mentor: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: { institutionId, isActive: true },
        _count: { role: true },
      }),
      prisma.evaluation.aggregate({
        where: { internship: { institutionId } },
        _avg: { overallScore: true },
        _count: { id: true },
      }),
    ]);

    const usersSummary = { MENTOR: 0, INTERN: 0 };
    userCounts.forEach((u) => {
      usersSummary[u.role] = u._count.role;
    });

    const metrics = {
      cohorts: { total: cohorts.length },
      users: usersSummary,
      evaluations: {
        avgOverall: evaluationsAggregate._avg.overallScore ? Number(evaluationsAggregate._avg.overallScore.toFixed(2)) : 0,
      },
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Institution_Audit_${institution.code}.pdf"`);

    await prisma.reportAudit.create({
      data: {
        type: 'INSTITUTION_SUMMARY',
        title: `Institution Audit Report: ${institution.name}`,
        institutionId,
        generatedById: userId,
      },
    });

    generateInstitutionSummaryPDF(
      {
        institution,
        metrics,
        cohorts,
      },
      res
    );
  } catch (error) {
    console.error('downloadInstitutionReport error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate institution summary PDF.',
        error: error.message,
      });
    }
  }
}

module.exports = {
  downloadInternReport,
  downloadInstitutionReport,
};
