const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const institutionRoutes = require('./routes/institution.routes');
const internshipRoutes = require('./routes/internship.routes');
const taskRoutes = require('./routes/task.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in development and Vercel preview/production domains
      if (!origin || config.nodeEnv === 'development' || origin.includes('vercel.app') || origin === config.clientUrl || origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/reports', reportRoutes);

// Root fallback route
app.get('/', (req, res) => {
  res.json({
    name: 'Multi-Institution Internship Management Platform API',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
