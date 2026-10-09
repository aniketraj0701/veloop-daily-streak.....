const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streak.controller');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Protect claim route against rapid automated request hammering (15 requests per minute per IP)
const claimLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many claim requests from this IP. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   GET /api/daily-streak
 * @desc    Get user's authoritative daily streak status, reward cards, and server timers
 * @access  Private / Auth
 */
router.get('/', authMiddleware, streakController.getStreakStatus);

/**
 * @route   POST /api/daily-streak/claim
 * @desc    Claim eligible daily streak reward with atomic concurrency safeguards
 * @access  Private / Auth
 */
router.post('/claim', authMiddleware, claimLimiter, streakController.claimReward);

/**
 * @route   GET /api/daily-streak/history
 * @desc    Fetch streak claims and wallet credit ledger history
 * @access  Private / Auth
 */
router.get('/history', authMiddleware, streakController.getClaimHistory);

/**
 * @route   POST /api/daily-streak/dev-simulate
 * @desc    Testing tool to simulate time-shifts (Fast-forward 24h, Missed-day reset, etc.)
 * @access  Development / Testing
 */
router.post('/dev-simulate', authMiddleware, streakController.simulateTimeShift);

module.exports = router;
