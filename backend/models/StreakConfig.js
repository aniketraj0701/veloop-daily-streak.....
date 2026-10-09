const mongoose = require('mongoose');

const StreakConfigSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 7,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    rewardType: {
      type: String,
      enum: ['VES', 'INR_GIFTCARD', 'MYSTERY_BOX'],
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    formattedReward: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '/assets/purple-giftbox.png',
    },
    badgeText: {
      type: String,
      default: '',
    },
    isMilestone: {
      type: Boolean,
      default: false,
    },
    isUltimateReward: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StreakConfig', StreakConfigSchema);
