import React from 'react';
import { Check, Lock, Clock, Sparkles } from 'lucide-react';
import styles from '../styles/RewardCard.module.css';

const formatTime = (totalSecs) => {
  if (totalSecs <= 0) return '00:00:00';
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const RewardCard = ({
  reward,
  onClaim,
  isClaiming,
  cooldownSeconds = 0,
}) => {
  const {
    day,
    title,
    formattedReward,
    icon,
    status,
    isUltimateReward,
  } = reward;

  const isAvailable = status === 'AVAILABLE';
  const isClaimed = status === 'CLAIMED';
  const isTodayLocked = status === 'TODAY';
  const isMissed = status === 'MISSED';

  let cardClass = styles.card;
  if (isAvailable) cardClass += ` ${styles.stateAvailable}`;
  else if (isClaimed) cardClass += ` ${styles.stateClaimed}`;
  else if (isTodayLocked) cardClass += ` ${styles.stateTodayLocked}`;
  else if (isMissed) cardClass += ` ${styles.stateMissed}`;
  else cardClass += ` ${styles.stateLocked}`;

  return (
    <div className={cardClass}>
      <div>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <span className={styles.dayTag}>Day 0{day}</span>
          {isClaimed ? (
            <span className={`${styles.statusBadge} ${styles.badgeClaimed}`}>Claimed</span>
          ) : isAvailable ? (
            <span className={`${styles.statusBadge} ${styles.badgeAvailable}`}>Eligible</span>
          ) : isTodayLocked ? (
            <span className={`${styles.statusBadge} ${styles.badgeCooldown}`}>Cooldown</span>
          ) : (
            <span className={`${styles.statusBadge} ${styles.badgeLocked}`}>Locked</span>
          )}
        </div>

        {/* Icon / Image Frame */}
        <div className={styles.iconFrame}>
          <img
            src={icon || '/assets/purple-giftbox.png'}
            alt={`Day ${day} Reward`}
            className={styles.rewardImage}
          />
        </div>

        {/* Reward Meta */}
        <div className={styles.metaBox}>
          <div className={styles.rewardTitle}>{title}</div>
          <div className={styles.rewardAmount}>{formattedReward}</div>
        </div>
      </div>

      {/* Action Area */}
      <div>
        {isClaimed ? (
          <button className={`${styles.actionBtn} ${styles.btnClaimed}`} disabled>
            <Check size={15} strokeWidth={2.5} />
            <span>Settled & Claimed</span>
          </button>
        ) : isAvailable ? (
          <button
            className={`${styles.actionBtn} ${styles.btnClaim}`}
            onClick={() => onClaim(day)}
            disabled={isClaiming}
          >
            <Sparkles size={15} />
            <span>{isClaiming ? 'Settling...' : 'Claim Reward'}</span>
          </button>
        ) : isTodayLocked ? (
          <div className={styles.cooldownChip}>
            <Clock size={14} />
            <span>Unlocks in {formatTime(cooldownSeconds)}</span>
          </div>
        ) : (
          <button className={`${styles.actionBtn} ${styles.btnLocked}`} disabled>
            <Lock size={14} />
            <span>Locked (Day {day})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardCard;
