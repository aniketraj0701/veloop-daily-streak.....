import React from 'react';
import { ShieldCheck, Coins } from 'lucide-react';

const Navbar = ({ wallet, streakCount, user }) => {
  return (
    <nav style={{
      backgroundColor: '#0d1017',
      borderBottom: '1px solid #1c2233',
      padding: '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="container-fluid max-w-7xl px-0 d-flex justify-content-between align-items-center">
        {/* Brand & System Title */}
        <div className="d-flex align-items-center gap-3">
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            background: '#1a1f30',
            border: '1px solid #2d3748',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img
              src="/assets/purple-giftbox.png"
              alt="VELoop"
              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}>
              VELoop
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
              color: '#94a3b8',
              background: '#151926',
              border: '1px solid #232a3d',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}>
              Loyalty Protocol
            </span>
          </div>
        </div>

        {/* Financial Ledger Balance Pills */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Streak Counter Pill */}
          <div className="d-none d-sm-flex align-items-center gap-2 px-3 py-1 rounded" style={{
            background: '#141824',
            border: '1px solid #232b3e',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
          }}>
            <img
              src="/assets/streak-flame.png"
              alt="Streak"
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            <span>{streakCount || 0}D Consecutive</span>
          </div>

          {/* VES Coins Balance */}
          <div className="d-flex align-items-center gap-2 px-3 py-1 rounded" style={{
            background: '#141824',
            border: '1px solid #232b3e',
            color: '#fbbf24',
            fontSize: '0.82rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
          }}>
            <Coins size={15} color="#f59e0b" />
            <span>{wallet?.ves?.toLocaleString() || 0} VES</span>
          </div>

          {/* Amazon Voucher Balance */}
          {wallet?.inrGiftCard > 0 && (
            <div className="d-flex align-items-center gap-2 px-3 py-1 rounded" style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 600,
            }}>
              <img
                src="/assets/amazon-card.png"
                alt="Amazon"
                style={{ width: '18px', height: '12px', objectFit: 'contain' }}
              />
              <span>₹{wallet.inrGiftCard} Gift Card</span>
            </div>
          )}

          {/* Member Profile Badge */}
          <div className="d-flex align-items-center gap-2 ps-2">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user?.name || 'User'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #283048',
                objectFit: 'cover',
              }}
            />
            <div className="d-none d-md-block text-start">
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.1 }}>
                {user?.name || 'Alex Hunter'}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={11} color="#10b981" /> Verified Member
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
