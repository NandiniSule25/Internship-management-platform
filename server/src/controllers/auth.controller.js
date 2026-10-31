const { prisma } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/token');

/**
 * Register a new user (Institution Admin, Mentor, or Intern)
 */
async function register(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      institutionId,
      newInstitutionName,
      newInstitutionCode,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'A user with this email address already exists.',
      });
    }

    let targetInstitutionId = institutionId;

    // If creating a new institution
    if (!targetInstitutionId && newInstitutionName && newInstitutionCode) {
      const codeUpper = newInstitutionCode.trim().toUpperCase();
      // Check if code exists
      let institution = await prisma.institution.findUnique({
        where: { code: codeUpper },
      });

      if (institution) {
        targetInstitutionId = institution.id;
      } else {
        institution = await prisma.institution.create({
          data: {
            name: newInstitutionName.trim(),
            code: codeUpper,
            contactEmail: normalizedEmail,
          },
        });
        targetInstitutionId = institution.id;
      }
    }

    // Verify institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: targetInstitutionId },
    });

    if (!institution) {
      return res.status(404).json({
        status: 'fail',
        message: 'Selected institution not found.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        phone: phone ? phone.trim() : null,
        institutionId: targetInstitutionId,
      },
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

    // Generate JWT token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      institutionId: newUser.institutionId,
    });

    // Exclude password from response
    const { password: _, ...userProfile } = newUser;

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to complete registration.',
      error: error.message,
    });
  }
}

/**
 * Log in an existing user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up user with institution
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact your institution administrator.',
      });
    }

    // Compare password with bcrypt hash
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    });

    // Exclude password
    const { password: _, ...userProfile } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      token,
      user: userProfile,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during login.',
      error: error.message,
    });
  }
}

/**
 * Get current authenticated user profile
 */
async function getMe(req, res) {
  try {
    // Fetch latest user details along with role-relevant summary metrics
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            code: true,
            contactEmail: true,
          },
        },
        _count: {
          select: {
            mentoredInternships: true,
            internships: true,
            assignedTasks: true,
            createdTasks: true,
            progressUpdates: true,
            evaluationsGiven: true,
            evaluationsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found.',
      });
    }

    const { password: _, ...userProfile } = user;

    return res.status(200).json({
      status: 'success',
      user: userProfile,
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user profile.',
    });
  }
}

/**
 * List public institutions for registration dropdown
 */
async function getInstitutions(req, res) {
  try {
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        contactEmail: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      status: 'success',
      count: institutions.length,
      institutions,
    });
  } catch (error) {
    console.error('getInstitutions error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve institutions list.',
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getInstitutions,
};
