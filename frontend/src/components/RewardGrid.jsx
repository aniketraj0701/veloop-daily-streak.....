import React from 'react';
import RewardCard from './RewardCard';
import styles from '../styles/RewardCard.module.css';

const RewardGrid = ({ rewards = [], onClaim, isClaiming, cooldownSeconds }) => {
  // Days 1 through 6 in the primary grid
  const primaryRewards = rewards.filter((r) => r.day <= 6);

  return (
    <div className={styles.gridContainer}>
      {primaryRewards.map((reward) => (
        <RewardCard
          key={reward.day}
          reward={reward}
          onClaim={onClaim}
          isClaiming={isClaiming}
          cooldownSeconds={cooldownSeconds}
        />
      ))}
    </div>
  );
};

export default RewardGrid;
