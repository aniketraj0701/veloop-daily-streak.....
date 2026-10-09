const streakService = require('../services/streak.service');
const walletService = require('../services/wallet.service');
const StreakClaim = require('../models/StreakClaim');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

/**
 * Controller handling Daily Streak requests
 */
class StreakController {
  /**
   * GET /api/daily-streak
   * Returns current streak state, authoritative server time, countdown timers, and reward cards
   */
  async getStreakStatus(req, res, next) {
    try {
      const userId = req.user._id;
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const state = await streakService.getUserStreakState(userId, {
        ip: clientIp,
        userAgent,
      });

      res.status(200).json(state);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/daily-streak/claim
   * Executes atomic reward claim with race-condition prevention
   */
  async claimReward(req, res, next) {
    try {
      const userId = req.user._id;
      const { day } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      const result = await streakService.claimDailyReward({
        userId,
        requestedDay: day,
        ipAddress: clientIp,
        userAgent,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/daily-streak/history
   * Retrieves transaction and claim audit trail for user
   */
  async getClaimHistory(req, res, next) {
    try {
      const userId = req.user._id;
      const limit = parseInt(req.query.limit, 10) || 20;

      const [claims, walletHistory, auditLogs] = await Promise.all([
        StreakClaim.find({ userId }).sort({ claimedAt: -1 }).limit(limit),
        walletService.getWalletHistory(userId, limit),
        AuditLog.find({ userId }).sort({ timestamp: -1 }).limit(limit),
      ]);

      res.status(200).json({
        success: true,
        claims,
        wallet: walletHistory.overview,
        transactions: walletHistory.transactions,
        auditLogs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/daily-streak/dev-simulate
   * Developer / QA tool to simulate clock advancement or simulate missed days safely
   */
  async simulateTimeShift(req, res, next) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Simulation endpoint is disabled in production environment.',
        });
      }

      const userId = req.user._id;
      const { action, hoursAgo, targetStreak } = req.body;
      const user = await User.findById(userId);

      if (action === 'FAST_FORWARD_24H') {
        // Shift lastClaimedAt back by 24.5 hours to simulate cooldown elapsed
        if (user.lastClaimedAt) {
          user.lastClaimedAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
          await user.save();
        }
      } else if (action === 'SIMULATE_MISSED_DAY') {
        // Shift lastClaimedAt back by 50 hours (>48h grace window)
        user.lastClaimedAt = new Date(Date.now() - 50 * 60 * 60 * 1000);
        await user.save();
      } else if (action === 'RESET_TO_DAY_ONE') {
        user.currentStreak = 0;
        user.lastClaimedAt = null;
        user.streakStatus = 'NEEDS_CLAIM';
        await user.save();
      } else if (action === 'SET_STREAK' && typeof targetStreak === 'number') {
        user.currentStreak = Math.min(7, Math.max(0, targetStreak));
        user.lastClaimedAt = new Date(Date.now() - (hoursAgo || 25) * 60 * 60 * 1000);
        await user.save();
      }

      const refreshedState = await streakService.getUserStreakState(userId, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.status(200).json({
        success: true,
        message: `Simulation '${action}' applied successfully.`,
        refreshedState,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StreakController();
