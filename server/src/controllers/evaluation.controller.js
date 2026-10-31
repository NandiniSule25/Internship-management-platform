const { prisma } = require('../config/db');

/**
 * Submit an evaluation for an intern
 * @route POST /api/evaluations
 * @access Private (Mentor, Institution Admin)
 */
async function createEvaluation(req, res) {
  try {
    const {
      internshipId,
      internId,
      technicalScore,
      communicationScore,
      punctualityScore,
      feedback,
      recommendation,
    } = req.body;

    const { id: mentorId, role, institutionId } = req.user;

    // Validation
    if (!internshipId || !feedback) {
      return res.status(400).json({
        status: 'fail',
        message: 'Internship ID and feedback comments are required.',
      });
    }

    const tech = parseInt(technicalScore, 10);
    const comm = parseInt(communicationScore, 10);
    const punct = parseInt(punctualityScore, 10);

    if (isNaN(tech) || tech < 1 || tech > 10 ||
        isNaN(comm) || comm < 1 || comm > 10 ||
        isNaN(punct) || punct < 1 || punct > 10) {
      return res.status(400).json({
        status: 'fail',
        message: 'Technical, communication, and punctuality scores must be integers between 1 and 10.',
      });
    }

    // Calculate overall average
    const overallScore = Number(((tech + comm + punct) / 3).toFixed(2));

    // Verify internship
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

    // Role check: Mentors can only evaluate cohorts they mentor
    if (role === 'MENTOR' && internship.mentorId !== mentorId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only submit evaluations for internships you supervise.',
      });
    }

    const targetInternId = internId || internship.internId;
    if (!targetInternId) {
      return res.status(400).json({
        status: 'fail',
        message: 'No enrolled intern found for this cohort to evaluate.',
      });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        internshipId,
        mentorId,
        internId: targetInternId,
        technicalScore: tech,
        communicationScore: comm,
        punctualityScore: punct,
        overallScore,
        feedback: feedback.trim(),
        recommendation: recommendation ? recommendation.trim() : 'Satisfactory Performance',
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true } },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Evaluation submitted successfully.',
      evaluation,
    });
  } catch (error) {
    console.error('createEvaluation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit evaluation.',
      error: error.message,
    });
  }
}

/**
 * List evaluations scoped by role and filters
 * @route GET /api/evaluations
 * @access Private
 */
async function getEvaluations(req, res) {
  try {
    const { internshipId, internId } = req.query;
    const { id: userId, role, institutionId } = req.user;

    const where = {
      internship: {
        institutionId,
      },
      ...(internshipId && { internshipId }),
      ...(internId && { internId }),
    };

    // Role scoping
    if (role === 'INTERN') {
      where.internId = userId;
    } else if (role === 'MENTOR' && !internshipId) {
      where.mentorId = userId;
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true } },
      },
      orderBy: { evaluatedAt: 'desc' },
    });

    return res.status(200).json({
      status: 'success',
      count: evaluations.length,
      evaluations,
    });
  } catch (error) {
    console.error('getEvaluations error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve evaluations.',
      error: error.message,
    });
  }
}

/**
 * Get single evaluation details
 * @route GET /api/evaluations/:id
 * @access Private
 */
async function getEvaluationById(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role, institutionId } = req.user;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true, email: true } },
        intern: { select: { id: true, firstName: true, lastName: true, email: true } },
        internship: { select: { id: true, title: true, department: true, institutionId: true } },
      },
    });

    if (!evaluation || evaluation.internship.institutionId !== institutionId) {
      return res.status(404).json({
        status: 'fail',
        message: 'Evaluation not found.',
      });
    }

    // Role check
    if (role === 'INTERN' && evaluation.internId !== userId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You can only view your own evaluations.',
      });
    }

    return res.status(200).json({
      status: 'success',
      evaluation,
    });
  } catch (error) {
    console.error('getEvaluationById error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve evaluation details.',
      error: error.message,
    });
  }
}

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
};
