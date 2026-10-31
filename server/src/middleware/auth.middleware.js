const { verifyToken } = require('../utils/token');
const { prisma } = require('../config/db');

/**
 * Middleware to authenticate requests via JWT Bearer token
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. No Bearer token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token.',
      });
    }

    // Retrieve active user from database to ensure user still exists and isActive = true
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User account not found or has been deactivated.',
      });
    }

    // Attach user profile (without password) to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      institutionId: user.institutionId,
      institution: user.institution,
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal authentication error.',
    });
  }
}

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param  {...string} roles Allowed roles (e.g. 'INSTITUTION_ADMIN', 'MENTOR')
 */
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthenticated user.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Access restricted to [${roles.join(', ')}]. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
