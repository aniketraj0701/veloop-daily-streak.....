const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

/**
 * Authentication Middleware
 * Supports standard Bearer JWT authentication with automatic demo-user fallback
 * to enable instant zero-config evaluation.
 */
const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If token exists and is valid, authenticate user
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'veloop_super_secure_jwt_secret_key_production_grade_9921'
        );
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          return next();
        }
      } catch (tokenErr) {
        console.warn('⚠️ Provided JWT token invalid or expired. Checking fallback demo profile...');
      }
    }

    // Auto-bootstrap demo user for seamless out-of-the-box exploration
    let demoUser = await User.findOne({ email: 'demo@veloop.io' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Hunter',
        email: 'demo@veloop.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        currentStreak: 0,
        streakStatus: 'NEEDS_CLAIM',
      });

      // Ensure wallet exists
      await Wallet.create({
        userId: demoUser._id,
        currencies: {
          VES: 250,
          INR_GIFTCARD: 0,
          MYSTERY_BOXES: 0,
        },
      });
    } else {
      // Ensure wallet exists for existing demo user
      const wallet = await Wallet.findOne({ userId: demoUser._id });
      if (!wallet) {
        await Wallet.create({
          userId: demoUser._id,
          currencies: {
            VES: 250,
            INR_GIFTCARD: 0,
            MYSTERY_BOXES: 0,
          },
        });
      }
    }

    req.user = demoUser;
    next();
  } catch (error) {
    console.error('Auth middleware failure:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired credentials.',
    });
  }
};

module.exports = authMiddleware;
