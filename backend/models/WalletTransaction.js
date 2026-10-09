const mongoose = require('mongoose');

const WalletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['VES', 'INR_GIFTCARD', 'MYSTERY_BOXES'],
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      default: 'CREDIT',
    },
    source: {
      type: String,
      default: 'DAILY_STREAK',
      enum: ['DAILY_STREAK', 'WELCOME_BONUS', 'REFERRAL', 'REDEMPTION', 'ADMIN_ADJUSTMENT'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StreakClaim',
    },
    metadata: {
      day: Number,
      cycleId: String,
      description: String,
    },
  },
  {
    timestamps: true,
  }
);

WalletTransactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('WalletTransaction', WalletTransactionSchema);
