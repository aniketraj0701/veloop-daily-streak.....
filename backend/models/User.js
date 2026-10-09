const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'VELoop Pioneer',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
    streakCycleId: {
      type: String,
      required: true,
      default: () => uuidv4(),
      index: true,
    },
    currentStreak: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 7,
    },
    totalLifetimeClaims: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastClaimedAt: {
      type: Date,
      default: null,
    },
    streakStatus: {
      type: String,
      enum: ['ACTIVE', 'NEEDS_CLAIM', 'COOLDOWN', 'RESET', 'COMPLETED'],
      default: 'NEEDS_CLAIM',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.JWT_SECRET || 'veloop_super_secure_jwt_secret_key_production_grade_9921',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
