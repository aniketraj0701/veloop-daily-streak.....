import React from 'react';
import styles from '../styles/RewardCard.module.css';

const StreakSkeleton = () => {
  return (
    <div>
      <div className={styles.gridContainer}>
        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
          <div
            key={num}
            className={styles.card}
            style={{
              background: 'rgba(24, 27, 49, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="d-flex justify-content-between mb-3">
              <div
                style={{
                  width: '60px',
                  height: '20px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  animation: 'pulseSkeleton 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '20px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  animation: 'pulseSkeleton 1.5s ease-in-out infinite',
                }}
              />
            </div>

            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                margin: '1rem auto',
                animation: 'pulseSkeleton 1.5s ease-in-out infinite',
              }}
            />

            <div className="text-center my-3">
              <div
                style={{
                  width: '120px',
                  height: '18px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  margin: '0 auto 8px auto',
                  animation: 'pulseSkeleton 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '80px',
                  height: '22px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  margin: '0 auto',
                  animation: 'pulseSkeleton 1.5s ease-in-out infinite',
                }}
              />
            </div>

            <div
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                marginTop: 'auto',
                animation: 'pulseSkeleton 1.5s ease-in-out infinite',
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulseSkeleton {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default StreakSkeleton;
