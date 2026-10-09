import React from 'react';
import { Check, Lock, ShieldCheck } from 'lucide-react';
import styles from '../styles/DailyStreak.module.css';

const StreakStats = ({ streakCount, checkedInCount, totalRewards = 7, wallet, rewards = [] }) => {
  const progressPercent = Math.min(100, Math.round((checkedInCount / totalRewards) * 100));

  return (
    <div>
      {/* 4-Stat Metric Row */}
      <div className={styles.statsRow}>
        {/* Metric 1 */}
        <div className={styles.statItem}>
          <div className={styles.statIconFrame}>
            <img
              src="/assets/streak-flame.png"
              alt="Streak Flame"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className={styles.statNumber}>{streakCount} / 7</div>
            <div className={styles.statSubtext}>Consecutive Days</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={styles.statItem}>
          <div className={styles.statIconFrame}>
            <img
              src="/assets/calendar-check.png"
              alt="Calendar Check"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className={styles.statNumber}>{checkedInCount} Days</div>
            <div className={styles.statSubtext}>Cycle Check-ins</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className={styles.statItem}>
          <div className={styles.statIconFrame}>
            <img
              src="/assets/giftbox-coins.png"
              alt="Wallet VES"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className={styles.statNumber}>{wallet?.ves?.toLocaleString() || 0} VES</div>
            <div className={styles.statSubtext}>Accumulated Balance</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className={styles.statItem}>
          <div className={styles.statIconFrame}>
            <img
              src="/assets/amazon-card.png"
              alt="Amazon Voucher"
              style={{ width: '28px', height: '18px', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div className={styles.statNumber}>₹500 INR</div>
            <div className={styles.statSubtext}>Day 7 Grand Target</div>
          </div>
        </div>
      </div>

      {/* 7-Day Cycle Timeline */}
      <div className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <div className={styles.timelineTitle}>
            <ShieldCheck size={16} color="#818cf8" />
            <span>Cycle Progression Matrix</span>
          </div>
          <div className={styles.timelineProgressNumber}>
            {checkedInCount} of {totalRewards} Completed ({progressPercent}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.timelineTrack}>
          <div
            className={styles.timelineFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 7 Timeline Nodes */}
        <div className={styles.timelineNodes}>
          {Array.from({ length: 7 }, (_, i) => i + 1).map((dayNum) => {
            const rewardItem = rewards.find((r) => r.day === dayNum);
            const isClaimed = rewardItem?.status === 'CLAIMED';
            const isAvailable = rewardItem?.status === 'AVAILABLE';
            const isToday = rewardItem?.status === 'TODAY' || isAvailable;
            const isUltimate = dayNum === 7;

            let pillClass = styles.nodePill;
            if (isClaimed) pillClass += ` ${styles.nodePillCompleted}`;
            else if (isToday) pillClass += ` ${styles.nodePillActive}`;
            else if (isUltimate) pillClass += ` ${styles.nodePillUltimate}`;

            return (
              <div key={dayNum} className={styles.timelineNode}>
                <div className={pillClass} title={`Day ${dayNum}: ${rewardItem?.formattedReward || ''}`}>
                  {isClaimed ? (
                    <Check size={15} strokeWidth={3} />
                  ) : isUltimate ? (
                    <span>D7</span>
                  ) : (
                    <span>D{dayNum}</span>
                  )}
                </div>
                <span className={styles.nodeCaption} style={{
                  color: isClaimed ? '#10b981' : isToday ? '#818cf8' : '#64748b',
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {rewardItem?.formattedReward?.split(' ')[0] || `Day ${dayNum}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakStats;
