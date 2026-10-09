import React from 'react';
import { Crown, Sparkles, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

const UltimateReward = ({ day7Config, onClaim, isEligible, currentStreak }) => {
  const isClaimed = day7Config?.status === 'CLAIMED';
  const isReady = day7Config?.status === 'AVAILABLE';

  return (
    <div style={{
      background: '#121522',
      border: '1px solid #232b3e',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
    }}>
      <div>
        {/* Card Header Tag */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2" style={{
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            color: '#fbbf24',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            <Crown size={13} color="#fbbf24" />
            <span>Grand Milestone • Day 7</span>
          </div>

          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#94a3b8',
          }}>
            {currentStreak}/7 Days Completed
          </span>
        </div>

        {/* Featured Image */}
        <div className="text-center my-3">
          <img
            src="/assets/crown-pedestal-gems.jpg"
            alt="Amazon Voucher Grand Prize"
            style={{
              width: '100%',
              maxHeight: '160px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #283248',
            }}
          />
        </div>

        {/* Title & Description */}
        <h3 style={{
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '0.4rem',
        }}>
          ₹500 Amazon Gift Card
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: '#94a3b8',
          lineHeight: 1.5,
          marginBottom: '1.25rem',
        }}>
          Complete all 7 consecutive daily check-ins to receive an instant digital Amazon voucher code and +500 VES loyalty points.
        </p>

        {/* Verification Checkpoints */}
        <div className="d-flex flex-column gap-2 mb-4" style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div className="d-flex align-items-center gap-2">
            <CheckCircle2 size={15} color="#10b981" />
            <span>Instant ledger credit upon Day 7 claim</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={15} color="#818cf8" />
            <span>Automatic cycle rollover & reset to Day 1</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isClaimed ? (
          <button
            className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem',
              fontWeight: 600,
              borderRadius: '6px',
            }}
          >
            <CheckCircle2 size={16} /> Grand Prize Claimed
          </button>
        ) : isReady ? (
          <button
            onClick={() => onClaim(7)}
            className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            style={{
              background: '#f59e0b',
              border: 'none',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '6px',
            }}
          >
            <Sparkles size={16} /> Claim ₹500 Amazon Voucher
          </button>
        ) : (
          <button
            className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled
            style={{
              background: '#161a26',
              border: '1px solid #232a3c',
              color: '#64748b',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              fontWeight: 500,
              borderRadius: '6px',
            }}
          >
            <Lock size={15} /> Locked until Day 7 ({7 - currentStreak} days remaining)
          </button>
        )}
      </div>
    </div>
  );
};

export default UltimateReward;
