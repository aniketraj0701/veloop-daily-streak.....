import React from 'react';
import { Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from '../styles/DailyStreak.module.css';

const formatTime = (totalSecs) => {
  if (totalSecs <= 0) return '00:00:00';
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const HeroBanner = ({ currentStreak, isEligibleToClaim, currentDay, cooldownSeconds, cycleId }) => {
  return (
    <div className={styles.heroGrid}>
      {/* Left Executive Hero Card */}
      <div className={styles.heroMainCard}>
        <div>
          <div className={styles.categoryTag}>
            <Shield size={13} color="#818cf8" />
            <span>Server-Authoritative Ledger • Cycle #{cycleId ? cycleId.slice(0, 8) : '001'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            Daily Streak & Reward Settlement
          </h1>

          <p className={styles.heroSubtitle}>
            Maintain consecutive 24-hour daily check-ins to unlock incremental VES points and 
            guarantee final Day 7 settlement of the ₹500 Amazon Gift Card voucher.
          </p>
        </div>

        <div className={styles.heroSummaryRow}>
          <div className={styles.summaryMetric}>
            <span className={styles.metricLabel}>Active Consecutive Days</span>
            <span className={styles.metricValue}>{currentStreak} of 7 Days</span>
          </div>

          <div className={styles.summaryMetric}>
            <span className={styles.metricLabel}>Next Eligible Target</span>
            <span className={styles.metricValue}>Day {currentDay}</span>
          </div>

          <div className={styles.summaryMetric}>
            <span className={styles.metricLabel}>Settlement Window</span>
            <span className={styles.metricValue}>24h Cooldown / 48h Grace</span>
          </div>
        </div>
      </div>

      {/* Right Executive Status Card */}
      <div className={styles.heroSideCard}>
        <div className={styles.sideCardTitle}>
          <span>Settlement Window</span>
          {isEligibleToClaim ? (
            <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>ELIGIBLE NOW</span>
          ) : (
            <span className="badge bg-warning text-dark" style={{ fontSize: '0.7rem' }}>IN COOLDOWN</span>
          )}
        </div>

        <div className={styles.cooldownBox}>
          <div className={styles.timerLabel}>Next Claim Settlement Window</div>
          <div className={styles.timerDisplay}>
            {isEligibleToClaim ? '00:00:00' : formatTime(cooldownSeconds)}
          </div>
          <div className={styles.timerLabel}>
            {isEligibleToClaim ? 'Ready to Claim Day ' + currentDay : 'Cooldown Active (Server-Authoritative)'}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          {isEligibleToClaim ? (
            <>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Your Day {currentDay} reward is available for instant credit.</span>
            </>
          ) : (
            <>
              <Clock size={14} color="#f59e0b" />
              <span>Server timer enforces strict 24-hour interval between claims.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
