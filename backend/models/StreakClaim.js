const mongoose = require('mongoose');

const StreakClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cycleId: {
      type: String,
      required: true,
      index: true,
    },
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
    rewardType: {
      type: String,
      required: true,
      enum: ['VES', 'INR_GIFTCARD', 'MYSTERY_BOX'],
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    rewardSnapshot: {
      type: Object,
      default: {},
    },
    claimedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      default: '0.0.0.0',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    walletTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalletTransaction',
    },
  },
  {
    timestamps: true,
  }
);

// Non-negotiable unique compound index to strictly prevent double-claiming within the same cycle
StreakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });
StreakClaimSchema.index({ userId: 1, claimedAt: -1 });

module.exports = mongoose.model('StreakClaim', StreakClaimSchema);
