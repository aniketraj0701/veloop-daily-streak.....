const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const StreakConfig = require('../models/StreakConfig');
const StreakClaim = require('../models/StreakClaim');
const AuditLog = require('../models/AuditLog');
const walletService = require('./wallet.service');

// Constants for time windows (in milliseconds)
const COOLDOWN_HOURS = parseFloat(process.env.CLAIM_COOLDOWN_HOURS || '24');
const GRACE_HOURS = parseFloat(process.env.CLAIM_GRACE_HOURS || '48');

const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
const GRACE_WINDOW_MS = GRACE_HOURS * 60 * 60 * 1000;

class StreakService {
  /**
   * Evaluates user's streak status, handles missed-day resets,
   * and prepares authoritative server state.
   */
  async getUserStreakState(userId, reqMetadata = {}) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const serverNow = new Date();
    const serverNowMs = serverNow.getTime();

    // Fetch default streak configurations (Days 1 - 7)
    let configs = await StreakConfig.find({ active: true }).sort({ day: 1 });
    if (!configs || configs.length === 0) {
      // Fallback in case seed hasn't run yet
      configs = this.getDefaultConfigs();
    }

    let { currentStreak, lastClaimedAt, streakCycleId } = user;
    let stateResetOccurred = false;

    // 1. Evaluate Missed Day Reset logic
    if (lastClaimedAt && currentStreak > 0) {
      const timeSinceLastClaimMs = serverNowMs - new Date(lastClaimedAt).getTime();

      // If user passed Day 7 and has finished the cycle, check if cooldown for new cycle passed
      if (currentStreak === 7) {
        if (timeSinceLastClaimMs >= COOLDOWN_MS) {
          // Rollover to brand new cycle
          streakCycleId = uuidv4();
          currentStreak = 0;
          user.streakCycleId = streakCycleId;
          user.currentStreak = 0;
          user.streakStatus = 'NEEDS_CLAIM';
          await user.save();
        }
      } else if (timeSinceLastClaimMs > GRACE_WINDOW_MS) {
        // Missed the 24h-48h execution window -> Automatic streak reset
        const prevStreak = currentStreak;
        streakCycleId = uuidv4();
        currentStreak = 0;
        user.streakCycleId = streakCycleId;
        user.currentStreak = 0;
        user.streakStatus = 'RESET';
        await user.save();
        stateResetOccurred = true;

        // Log audit trail for automatic reset
        await AuditLog.create({
          userId: user._id,
          action: 'STREAK_RESET',
          metadata: {
            reason: 'MISSED_EXECUTION_WINDOW',
            elapsedHours: (timeSinceLastClaimMs / (1000 * 60 * 60)).toFixed(2),
            previousStreak: prevStreak,
            newCycleId: streakCycleId,
          },
          ipAddress: reqMetadata.ip || '0.0.0.0',
          userAgent: reqMetadata.userAgent || 'Unknown',
          timestamp: serverNow,
        });
      }
    }

    // 2. Determine eligibility and nextClaimAt
    let nextClaimAt = null;
    let cooldownRemainingMs = 0;
    let isEligibleToClaim = false;
    let expectedNextDay = currentStreak === 7 ? 1 : currentStreak + 1;

    if (!lastClaimedAt || currentStreak === 0) {
      // Brand new or reset user -> Day 1 is immediately available
      isEligibleToClaim = true;
      expectedNextDay = 1;
      nextClaimAt = null;
    } else {
      const timeSinceLastClaimMs = serverNowMs - new Date(lastClaimedAt).getTime();

      if (timeSinceLastClaimMs < COOLDOWN_MS) {
        // In cooldown period
        const unlockTimeMs = new Date(lastClaimedAt).getTime() + COOLDOWN_MS;
        nextClaimAt = new Date(unlockTimeMs);
        cooldownRemainingMs = Math.max(0, unlockTimeMs - serverNowMs);
        isEligibleToClaim = false;
      } else {
        // Eligible to claim right now
        isEligibleToClaim = true;
        nextClaimAt = null;
        cooldownRemainingMs = 0;
      }
    }

    // 3. Fetch all claims in current cycle
    const cycleClaims = await StreakClaim.find({
      userId: user._id,
      cycleId: streakCycleId,
    }).sort({ day: 1 });

    const claimedDaySet = new Set(cycleClaims.map((c) => c.day));

    // 4. Map rewards array with explicit statuses
    const rewards = configs.map((cfg) => {
      const dayNum = cfg.day;
      let status = 'LOCKED';

      if (claimedDaySet.has(dayNum)) {
        status = 'CLAIMED';
      } else if (dayNum === expectedNextDay) {
        if (isEligibleToClaim) {
          status = 'AVAILABLE'; // Active claimable button
        } else {
          status = 'TODAY'; // Today's target, but locked waiting for cooldown
        }
      } else if (dayNum < expectedNextDay && !claimedDaySet.has(dayNum)) {
        status = 'MISSED';
      } else {
        status = 'LOCKED';
      }

      return {
        day: dayNum,
        title: cfg.title,
        subtitle: cfg.subtitle,
        rewardType: cfg.rewardType,
        rewardAmount: cfg.rewardAmount,
        formattedReward: cfg.formattedReward,
        icon: cfg.icon,
        badgeText: cfg.badgeText,
        isMilestone: cfg.isMilestone,
        isUltimateReward: cfg.isUltimateReward,
        description: cfg.description,
        status,
        claimedAt: cycleClaims.find((c) => c.day === dayNum)?.claimedAt || null,
      };
    });

    // 5. Get Wallet Balance overview
    const wallet = await walletService.getOrCreateWallet(user._id);

    return {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      currentStreak,
      currentDay: expectedNextDay,
      checkedInCount: cycleClaims.length,
      totalRewards: 7,
      isEligibleToClaim,
      serverTime: serverNow.toISOString(),
      nextClaimAt: nextClaimAt ? nextClaimAt.toISOString() : null,
      cooldownRemainingMs,
      cycleId: streakCycleId,
      streakStatus: user.streakStatus,
      stateResetOccurred,
      rewards,
      wallet: wallet.getOverview(),
    };
  }

  /**
   * Atomic, idempotent streak claim processor with transaction support
   */
  async claimDailyReward({ userId, requestedDay, ipAddress = '0.0.0.0', userAgent = 'Unknown' }) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User account not found');
      err.statusCode = 404;
      throw err;
    }

    const serverNow = new Date();
    const serverNowMs = serverNow.getTime();

    // 1. Check Missed Day before processing claim
    let { currentStreak, lastClaimedAt, streakCycleId } = user;

    if (lastClaimedAt && currentStreak > 0) {
      const timeSinceLastClaimMs = serverNowMs - new Date(lastClaimedAt).getTime();

      // If grace window expired (>48h), reset cycle
      if (timeSinceLastClaimMs > GRACE_WINDOW_MS) {
        streakCycleId = uuidv4();
        currentStreak = 0;
        user.streakCycleId = streakCycleId;
        user.currentStreak = 0;
        user.streakStatus = 'RESET';
        await user.save();

        await AuditLog.create({
          userId: user._id,
          action: 'STREAK_RESET',
          metadata: {
            reason: 'GRACE_PERIOD_EXPIRED_BEFORE_CLAIM',
            timeSinceLastClaimHours: (timeSinceLastClaimMs / (1000 * 60 * 60)).toFixed(2),
          },
          ipAddress,
          userAgent,
          timestamp: serverNow,
        });
      }
    }

    // 2. Validate expected day progression
    const expectedDay = currentStreak === 7 ? 1 : currentStreak + 1;

    // Check if user is attempting to skip or jump days
    if (requestedDay !== undefined && requestedDay !== null && Number(requestedDay) !== expectedDay) {
      await AuditLog.create({
        userId: user._id,
        action: 'INVALID_CLAIM_ATTEMPT',
        metadata: {
          requestedDay,
          expectedDay,
          currentStreak,
          reason: 'OUT_OF_SEQUENCE_CLAIM_ATTEMPT',
        },
        ipAddress,
        userAgent,
        timestamp: serverNow,
      });

      const err = new Error(`Invalid claim progression. Expected Day ${expectedDay}, but Day ${requestedDay} was requested.`);
      err.statusCode = 400;
      err.code = 'INVALID_DAY_SEQUENCE';
      throw err;
    }

    // 3. Verify 24-hour Cooldown Period
    if (lastClaimedAt && currentStreak > 0 && currentStreak < 7) {
      const timeSinceLastClaimMs = serverNowMs - new Date(lastClaimedAt).getTime();
      if (timeSinceLastClaimMs < COOLDOWN_MS) {
        const remainingMs = COOLDOWN_MS - timeSinceLastClaimMs;
        const nextEligibleTime = new Date(new Date(lastClaimedAt).getTime() + COOLDOWN_MS);

        await AuditLog.create({
          userId: user._id,
          action: 'CLAIM_COOLDOWN_ACTIVE',
          metadata: {
            timeSinceLastClaimMs,
            remainingMs,
            nextEligibleTime,
          },
          ipAddress,
          userAgent,
          timestamp: serverNow,
        });

        const err = new Error('Daily reward cooldown is active. Please wait for the 24-hour cycle timer.');
        err.statusCode = 429;
        err.code = 'COOLDOWN_ACTIVE';
        err.nextClaimAt = nextEligibleTime.toISOString();
        throw err;
      }
    }

    // 4. Retrieve reward configuration for expectedDay
    let rewardConfig = await StreakConfig.findOne({ day: expectedDay, active: true });
    if (!rewardConfig) {
      const defaultConfigs = this.getDefaultConfigs();
      rewardConfig = defaultConfigs.find((c) => c.day === expectedDay);
    }

    if (!rewardConfig) {
      const err = new Error(`Configuration for Day ${expectedDay} reward not found.`);
      err.statusCode = 500;
      throw err;
    }

    // 5. Atomic Claim Execution with Compound Index Protection
    // Attempt to insert StreakClaim. If a duplicate exists for (userId, cycleId, day), MongoDB throws E11000
    let streakClaim;
    try {
      streakClaim = await StreakClaim.create({
        userId: user._id,
        cycleId: streakCycleId,
        day: expectedDay,
        rewardType: rewardConfig.rewardType,
        rewardAmount: rewardConfig.rewardAmount,
        rewardSnapshot: {
          title: rewardConfig.title,
          subtitle: rewardConfig.subtitle,
          formattedReward: rewardConfig.formattedReward,
          isMilestone: rewardConfig.isMilestone,
          isUltimateReward: rewardConfig.isUltimateReward,
        },
        claimedAt: serverNow,
        ipAddress,
        userAgent,
      });
    } catch (duplicateErr) {
      // Catch duplicate key error to guarantee idempotency under high concurrency
      if (duplicateErr.code === 11000) {
        await AuditLog.create({
          userId: user._id,
          action: 'DUPLICATE_CLAIM_ATTEMPT',
          metadata: {
            cycleId: streakCycleId,
            day: expectedDay,
            reason: 'CONCURRENT_OR_REPEAT_REQUEST_BLOCKED',
          },
          ipAddress,
          userAgent,
          timestamp: serverNow,
        });

        const err = new Error(`Day ${expectedDay} reward has already been claimed for this cycle.`);
        err.statusCode = 409;
        err.code = 'DUPLICATE_CLAIM';
        throw err;
      }
      throw duplicateErr;
    }

    // 6. Credit Wallet and Record Financial Ledger
    const creditResult = await walletService.creditReward({
      userId: user._id,
      currency: rewardConfig.rewardType,
      amount: rewardConfig.rewardAmount,
      source: 'DAILY_STREAK',
      referenceId: streakClaim._id,
      metadata: {
        day: expectedDay,
        cycleId: streakCycleId,
        description: `Daily Streak Reward - Day ${expectedDay} (${rewardConfig.formattedReward})`,
      },
    });

    // Attach transaction ID to claim record
    streakClaim.walletTransactionId = creditResult.transaction._id;
    await streakClaim.save();

    // 7. Update User Streak Progression
    user.currentStreak = expectedDay;
    user.lastClaimedAt = serverNow;
    user.totalLifetimeClaims = (user.totalLifetimeClaims || 0) + 1;
    user.streakStatus = expectedDay === 7 ? 'COMPLETED' : 'ACTIVE';
    await user.save();

    // 8. Record Successful Audit Log
    await AuditLog.create({
      userId: user._id,
      action: 'STREAK_CLAIM_SUCCESS',
      metadata: {
        day: expectedDay,
        cycleId: streakCycleId,
        rewardAmount: rewardConfig.rewardAmount,
        rewardType: rewardConfig.rewardType,
        isMilestone: rewardConfig.isMilestone,
        isUltimateReward: rewardConfig.isUltimateReward,
        walletBalanceAfter: creditResult.transaction.balanceAfter,
      },
      ipAddress,
      userAgent,
      timestamp: serverNow,
    });

    // 9. Return refreshed state
    const refreshedState = await this.getUserStreakState(user._id, { ip: ipAddress, userAgent });

    return {
      success: true,
      message: `Congratulations! Day ${expectedDay} reward of ${rewardConfig.formattedReward} claimed successfully!`,
      claimedReward: {
        day: expectedDay,
        title: rewardConfig.title,
        subtitle: rewardConfig.subtitle,
        rewardType: rewardConfig.rewardType,
        rewardAmount: rewardConfig.rewardAmount,
        formattedReward: rewardConfig.formattedReward,
        isMilestone: rewardConfig.isMilestone,
        isUltimateReward: rewardConfig.isUltimateReward,
        claimedAt: serverNow.toISOString(),
      },
      transaction: {
        id: creditResult.transaction._id,
        balanceBefore: creditResult.transaction.balanceBefore,
        balanceAfter: creditResult.transaction.balanceAfter,
        currency: creditResult.transaction.currency,
      },
      refreshedState,
    };
  }

  /**
   * Default fallback rewards if database is empty
   */
  getDefaultConfigs() {
    return [
      {
        day: 1,
        title: 'Day 1 Starter',
        subtitle: '+20 VES Coins',
        rewardType: 'VES',
        rewardAmount: 20,
        formattedReward: '+20 VES',
        icon: '/assets/purple-giftbox.png',
        badgeText: 'KICKSTART',
        isMilestone: false,
        isUltimateReward: false,
        description: 'Begin your streak journey and earn VES reward points.',
      },
      {
        day: 2,
        title: 'Day 2 Momentum',
        subtitle: '+40 VES Coins',
        rewardType: 'VES',
        rewardAmount: 40,
        formattedReward: '+40 VES',
        icon: '/assets/giftbox-coins.png',
        badgeText: '2X BOOST',
        isMilestone: false,
        isUltimateReward: false,
        description: 'Keep momentum high with 40 VES coins added to your wallet.',
      },
      {
        day: 3,
        title: 'Day 3 Multiplier',
        subtitle: '+75 VES Coins',
        rewardType: 'VES',
        rewardAmount: 75,
        formattedReward: '+75 VES',
        icon: '/assets/growth-arrow.png',
        badgeText: '3-DAY STREAK',
        isMilestone: true,
        isUltimateReward: false,
        description: 'Reach the 3-day milestone and unlock rapid coin growth.',
      },
      {
        day: 4,
        title: 'Day 4 Powerhouse',
        subtitle: '+100 VES Coins',
        rewardType: 'VES',
        rewardAmount: 100,
        formattedReward: '+100 VES',
        icon: '/assets/purple-giftbox.png',
        badgeText: 'HALF-WAY',
        isMilestone: false,
        isUltimateReward: false,
        description: 'Halfway through the weekly cycle with solid coin earnings.',
      },
      {
        day: 5,
        title: 'Day 5 Surge',
        subtitle: '+150 VES Coins',
        rewardType: 'VES',
        rewardAmount: 150,
        formattedReward: '+150 VES',
        icon: '/assets/growth-arrow.png',
        badgeText: 'BIG SURGE',
        isMilestone: true,
        isUltimateReward: false,
        description: 'Exponential coin surge for committed VELoop members.',
      },
      {
        day: 6,
        title: 'Day 6 Elite Box',
        subtitle: '+200 VES Coins',
        rewardType: 'VES',
        rewardAmount: 200,
        formattedReward: '+200 VES',
        icon: '/assets/reward-box-open.jpg',
        badgeText: 'EVE OF GLORY',
        isMilestone: false,
        isUltimateReward: false,
        description: 'One step away from the Ultimate Amazon voucher!',
      },
      {
        day: 7,
        title: 'Ultimate Reward',
        subtitle: 'Amazon Gift Card ₹500 + 500 VES',
        rewardType: 'INR_GIFTCARD',
        rewardAmount: 500,
        formattedReward: '₹500 Amazon Gift Card',
        icon: '/assets/ultimate-reward-crown.jpg',
        badgeText: '👑 ULTIMATE REWARD',
        isMilestone: true,
        isUltimateReward: true,
        description: 'Grand prize 7-Day Ultimate Reward: ₹500 Amazon Gift Card voucher code!',
      },
    ];
  }
}

module.exports = new StreakService();
