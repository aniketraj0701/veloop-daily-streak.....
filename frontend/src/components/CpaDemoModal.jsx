import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, X, Terminal, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const CpaDemoModal = ({ isOpen, onClose, day, rewardInfo, onConfirmClaim, isProcessing, claimSuccessData }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isOpen && !claimSuccessData) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 400);
      const timer2 = setTimeout(() => {
        setStep(3);
        onConfirmClaim();
      }, 900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, claimSuccessData]);

  useEffect(() => {
    if (claimSuccessData) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#f59e0b', '#10b981', '#ffffff'],
        });
      } catch (e) {
        console.warn('Confetti:', e);
      }
    }
  }, [claimSuccessData]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(8, 10, 15, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          background: '#121622',
          border: '1px solid #232c40',
          borderRadius: '10px',
          maxWidth: '460px',
          width: '100%',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          position: 'relative',
        }}
      >
        {/* Close Button if finished */}
        {claimSuccessData && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: '#1c2232',
              border: '1px solid #2d374d',
              borderRadius: '4px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        )}

        {!claimSuccessData ? (
          <div>
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <ShieldCheck size={18} color="#818cf8" />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#818cf8',
                textTransform: 'uppercase',
              }}>
                Server Settlement Verification
              </span>
            </div>

            <h3 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#ffffff',
              marginBottom: '0.5rem',
            }}>
              Settling Day 0{day} Reward
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Authorizing cryptographic server timestamp & executing atomic wallet balance credit.
            </p>

            {/* Verification Steps List */}
            <div className="d-flex flex-column gap-2 mb-3">
              <div
                className="d-flex align-items-center gap-2 p-2 rounded"
                style={{
                  background: step >= 1 ? '#171c2b' : '#121520',
                  border: `1px solid ${step >= 1 ? '#2b3650' : '#1c2232'}`,
                  color: step >= 1 ? '#cbd5e1' : '#64748b',
                  fontSize: '0.8rem',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <CheckCircle2 size={15} color={step >= 1 ? '#818cf8' : '#475569'} />
                <span>1. Validating 24h cooldown server timestamp</span>
              </div>

              <div
                className="d-flex align-items-center gap-2 p-2 rounded"
                style={{
                  background: step >= 2 ? '#171c2b' : '#121520',
                  border: `1px solid ${step >= 2 ? '#2b3650' : '#1c2232'}`,
                  color: step >= 2 ? '#cbd5e1' : '#64748b',
                  fontSize: '0.8rem',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <CheckCircle2 size={15} color={step >= 2 ? '#f59e0b' : '#475569'} />
                <span>2. Generating atomic ledger transaction record</span>
              </div>

              <div
                className="d-flex align-items-center gap-2 p-2 rounded"
                style={{
                  background: step >= 3 ? '#171c2b' : '#121520',
                  border: `1px solid ${step >= 3 ? '#2b3650' : '#1c2232'}`,
                  color: step >= 3 ? '#cbd5e1' : '#64748b',
                  fontSize: '0.8rem',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                <CheckCircle2 size={15} color={step >= 3 ? '#10b981' : '#475569'} />
                <span>3. Crediting multi-currency digital balance</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Success Receipt */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#10b981',
                textTransform: 'uppercase',
              }}>
                Settlement Completed
              </span>
            </div>

            <h3 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: '1.4rem',
              color: '#ffffff',
              marginBottom: '0.4rem',
            }}>
              {claimSuccessData?.claimedReward?.formattedReward}
            </h3>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Day 0{day} reward has been settled and credited to your verified wallet ledger.
            </p>

            {/* Receipt Box */}
            <div style={{
              background: '#0d1017',
              border: '1px solid #1e2436',
              borderRadius: '6px',
              padding: '0.85rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.78rem',
              color: '#94a3b8',
              marginBottom: '1.25rem',
            }}>
              <div className="d-flex justify-content-between mb-1">
                <span>Transaction Ref:</span>
                <span className="text-light">{claimSuccessData?.transaction?.id?.slice(-8) || 'TX-9901'}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Balance Before:</span>
                <span className="text-light">{claimSuccessData?.transaction?.balanceBefore} VES</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>New Balance:</span>
                <span className="text-success font-weight-bold">{claimSuccessData?.transaction?.balanceAfter} VES</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              style={{
                background: '#4f46e5',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.88rem',
                fontWeight: 600,
                borderRadius: '6px',
              }}
            >
              <span>Back to Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CpaDemoModal;
