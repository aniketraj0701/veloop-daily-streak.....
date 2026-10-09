const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currencies: {
      VES: {
        type: Number,
        default: 0,
        min: 0,
      },
      INR_GIFTCARD: {
        type: Number,
        default: 0,
        min: 0,
      },
      MYSTERY_BOXES: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    lastUpdatedBy: {
      type: String,
      default: 'SYSTEM',
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to retrieve unified balance overview
WalletSchema.methods.getOverview = function () {
  return {
    ves: this.currencies.VES || 0,
    inrGiftCard: this.currencies.INR_GIFTCARD || 0,
    mysteryBoxes: this.currencies.MYSTERY_BOXES || 0,
    totalEstimatedValueInr: (this.currencies.VES || 0) * 0.1 + (this.currencies.INR_GIFTCARD || 0),
  };
};

module.exports = mongoose.model('Wallet', WalletSchema);
