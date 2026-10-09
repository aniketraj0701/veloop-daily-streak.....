const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'STREAK_CLAIM_SUCCESS',
        'DUPLICATE_CLAIM_ATTEMPT',
        'INVALID_CLAIM_ATTEMPT',
        'STREAK_RESET',
        'CLAIM_COOLDOWN_ACTIVE',
        'TAMPERING_SUSPECTED',
      ],
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '0.0.0.0',
    },
    userAgent: {
      type: String,
      default: 'Unknown',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
