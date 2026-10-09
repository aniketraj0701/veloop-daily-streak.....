import React from 'react';
import { Sparkles } from 'lucide-react';

const StreakLoader = ({ message = 'Synchronizing with VELoop Server...' }) => {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '70px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(139, 92, 246, 0.2)',
            borderTopColor: '#a855f7',
            borderRightColor: '#f59e0b',
            animation: 'spinLoader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
          }}
        />
        <Sparkles size={28} color="#c084fc" />
      </div>

      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e5e7eb' }}>
        {message}
      </div>

      <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
        Fetching server-authoritative timestamps & cryptographic state...
      </div>

      <style>{`
        @keyframes spinLoader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StreakLoader;
