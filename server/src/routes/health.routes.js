const express = require('express');
const { prisma } = require('../config/db');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Check overall API health status
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Multi-Institution Internship Management Platform API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @route   GET /api/health/db
 * @desc    Verify PostgreSQL database connectivity via Prisma
 * @access  Public
 */
router.get('/db', async (req, res) => {
  try {
    const startTime = Date.now();
    // Run a lightweight raw query to test PostgreSQL connection
    const result = await prisma.$queryRaw`SELECT 1 as connected, NOW() as current_time`;
    const latency = Date.now() - startTime;

    res.status(200).json({
      status: 'success',
      message: 'PostgreSQL database connection is healthy',
      database: 'PostgreSQL',
      latencyMs: latency,
      data: result[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database health check error:', error.message);
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
