const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');
const StreakConfig = require('../models/StreakConfig');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

dotenv.config();

const streakRewardsSeedData = [
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
    description: 'Begin your weekly streak journey and claim your initial VES coin reward.',
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
    description: 'Double your earning rate as you cement your daily check-in habit.',
  },
  {
    day: 3,
    title: 'Day 3 Growth Boost',
    subtitle: '+75 VES Coins',
    rewardType: 'VES',
    rewardAmount: 75,
    formattedReward: '+75 VES',
    icon: '/assets/growth-arrow.png',
    badgeText: '3-DAY STREAK',
    isMilestone: true,
    isUltimateReward: false,
    description: 'Unlock rapid growth with the 3-day consistency milestone bonus.',
  },
  {
    day: 4,
    title: 'Day 4 Midpoint',
    subtitle: '+100 VES Coins',
    rewardType: 'VES',
    rewardAmount: 100,
    formattedReward: '+100 VES',
    icon: '/assets/purple-giftbox.png',
    badgeText: 'HALF-WAY',
    isMilestone: false,
    isUltimateReward: false,
    description: 'Past the halfway point! 100 VES Coins credited instantly.',
  },
  {
    day: 5,
    title: 'Day 5 Surge',
    subtitle: '+150 VES Coins',
    rewardType: 'VES',
    rewardAmount: 150,
    formattedReward: '+150 VES',
    icon: '/assets/growth-arrow.png',
    badgeText: 'MAJOR SURGE',
    isMilestone: true,
    isUltimateReward: false,
    description: 'Exponential coin surge for top VELoop community participants.',
  },
  {
    day: 6,
    title: 'Day 6 Mystery Box',
    subtitle: '+200 VES Coins',
    rewardType: 'VES',
    rewardAmount: 200,
    formattedReward: '+200 VES',
    icon: '/assets/reward-box-open.jpg',
    badgeText: 'EVE OF GLORY',
    isMilestone: false,
    isUltimateReward: false,
    description: 'High-tier reward box preparing you for the Ultimate Day 7 prize.',
  },
  {
    day: 7,
    title: 'Day 7 Ultimate Reward',
    subtitle: '₹500 Amazon Voucher + 500 VES',
    rewardType: 'INR_GIFTCARD',
    rewardAmount: 500,
    formattedReward: '₹500 Amazon Gift Card',
    icon: '/assets/ultimate-reward-crown.jpg',
    badgeText: '👑 ULTIMATE REWARD',
    isMilestone: true,
    isUltimateReward: true,
    description: 'Grand prize 7-Day milestone: ₹500 Amazon Gift Card voucher code!',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting VELoop Daily Streak database seeding...');
    await connectDB();

    // 1. Seed Streak Configuration
    for (const reward of streakRewardsSeedData) {
      await StreakConfig.findOneAndUpdate(
        { day: reward.day },
        { ...reward, active: true },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Seeded 7-day streak reward configurations successfully.');

    // 2. Ensure default demo user exists
    let demoUser = await User.findOne({ email: 'demo@veloop.io' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Alex Hunter',
        email: 'demo@veloop.io',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        currentStreak: 0,
        streakStatus: 'NEEDS_CLAIM',
      });
      console.log('✅ Created demo user (demo@veloop.io)');
    }

    // 3. Ensure demo wallet exists
    let wallet = await Wallet.findOne({ userId: demoUser._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: demoUser._id,
        currencies: {
          VES: 350,
          INR_GIFTCARD: 0,
          MYSTERY_BOXES: 0,
        },
      });
      console.log('✅ Initialized demo user wallet.');
    }

    console.log('🚀 Seeding finished successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

// If run directly from terminal
if (require.main === module) {
  seedDatabase().then(() => {
    disconnectDB().then(() => process.exit(0));
  });
}

module.exports = { seedDatabase, streakRewardsSeedData };
