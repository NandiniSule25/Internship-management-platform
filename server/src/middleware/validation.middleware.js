/**
 * Validate user registration input
 */
function validateRegister(req, res, next) {
  const { email, password, firstName, lastName, role, institutionId, newInstitutionName, newInstitutionCode } = req.body;

  const errors = [];

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push('A valid email address is required.');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email format.');
    }
  }

  // Password validation (min 6 characters)
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  // Name validation
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    errors.push('First name is required.');
  }

  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    errors.push('Last name is required.');
  }

  // Role validation
  const validRoles = ['INSTITUTION_ADMIN', 'MENTOR', 'INTERN'];
  if (!role || !validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(', ')}.`);
  }

  // Institution validation (either existing institutionId or newInstitutionName + code)
  if (!institutionId && (!newInstitutionName || !newInstitutionCode)) {
    errors.push('Please select an existing institution or provide a new institution name and code.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

/**
 * Validate user login input
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};
