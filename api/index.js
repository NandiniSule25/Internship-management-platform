// Serverless function entry point for Vercel deployment
const app = require('../server/src/app');

// Ensure root /api route returns health/info
app.get('/api', (req, res) => {
  res.json({
    name: 'Multi-Institution Internship Management Platform API',
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    endpoints: {
      health: '/api/health',
      database: '/api/health/db',
      auth: '/api/auth',
      institutions: '/api/institutions',
      internships: '/api/internships',
      tasks: '/api/tasks',
      evaluations: '/api/evaluations',
      reports: '/api/reports',
    },
  });
});

module.exports = app;
