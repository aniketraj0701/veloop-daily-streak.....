import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import StreakStats from '../components/StreakStats';
import UltimateReward from '../components/UltimateReward';
import RewardGrid from '../components/RewardGrid';
import CpaDemoModal from '../components/CpaDemoModal';
import StreakSkeleton from '../components/StreakSkeleton';
import StreakLoader from '../components/StreakLoader';
import streakApi from '../services/streakApi';
import styles from '../styles/DailyStreak.module.css';
import { Sparkles, Terminal, RefreshCw, History, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

const DailyStreakPage = () => {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Server-Authoritative Time delta
  const [serverTimeDelta, setServerTimeDelta] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Claim modal state
  const [selectedClaimDay, setSelectedClaimDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessData, setClaimSuccessData] = useState(null);

  // Dev / History tabs
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const prevNextClaimAtRef = useRef(null);

  // 1. Fetch Authoritative Streak State from Backend
  const loadStreakState = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await streakApi.getStreakState();
      setStreakData(data);
      setError(null);

      // Calculate server time offset to completely neutralize client clock tampering
      if (data.serverTime) {
        const serverMs = new Date(data.serverTime).getTime();
        const clientMs = Date.now();
        const delta = serverMs - clientMs;
        setServerTimeDelta(delta);

        if (data.nextClaimAt) {
          const nextMs = new Date(data.nextClaimAt).getTime();
          const initialRemaining = Math.max(0, Math.floor((nextMs - serverMs) / 1000));
          setCooldownSeconds(initialRemaining);
          prevNextClaimAtRef.current = data.nextClaimAt;
        } else {
          setCooldownSeconds(0);
        }
      }

      if (data.stateResetOccurred) {
        showToast('⚠️ Consecutive check-in streak was reset due to 48-hour inactivity threshold.', 'warning');
      }
    } catch (err) {
      console.error('Failed to load streak state:', err);
      setError(err.response?.data?.message || 'Could not connect to VELoop backend server.');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreakState(true);
  }, [loadStreakState]);

  // 2. Authoritative 1-Second Timer Tick
  useEffect(() => {
    if (!streakData?.nextClaimAt) {
      setCooldownSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      const nowServerMs = Date.now() + serverTimeDelta;
      const targetMs = new Date(streakData.nextClaimAt).getTime();
      const remaining = Math.max(0, Math.floor((targetMs - nowServerMs) / 1000));

      setCooldownSeconds(remaining);

      // Auto-synchronize with server the instant the timer hits zero
      if (remaining === 0 && prevNextClaimAtRef.current) {
        prevNextClaimAtRef.current = null;
        loadStreakState(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [streakData?.nextClaimAt, serverTimeDelta, loadStreakState]);

  // Toast Notification helper
  const showToast = (message, type = 'info') => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 3. Initiate Claim Workflow
  const handleInitiateClaim = (day) => {
    setSelectedClaimDay(day);
    setClaimSuccessData(null);
    setIsModalOpen(true);
  };

  // 4. Confirm Claim Execution with Server
  const handleConfirmClaim = async () => {
    if (!selectedClaimDay || isClaiming) return;

    setIsClaiming(true);
    try {
      const response = await streakApi.claimStreak(selectedClaimDay);
      setClaimSuccessData(response);
      setStreakData(response.refreshedState);

      // Update timer params
      if (response.refreshedState?.nextClaimAt) {
        const serverMs = new Date(response.refreshedState.serverTime).getTime();
        const nextMs = new Date(response.refreshedState.nextClaimAt).getTime();
        setCooldownSeconds(Math.max(0, Math.floor((nextMs - serverMs) / 1000)));
        prevNextClaimAtRef.current = response.refreshedState.nextClaimAt;
      } else {
        setCooldownSeconds(0);
      }

      showToast(`Settled: Day ${response.claimedReward.day} (${response.claimedReward.formattedReward})`, 'success');
    } catch (err) {
      console.error('Claim failed:', err);
      const errMsg = err.response?.data?.message || 'Reward claim failed. Please try again.';
      showToast(`❌ ${errMsg}`, 'danger');
      setIsModalOpen(false);
      loadStreakState(false);
    } finally {
      setIsClaiming(false);
    }
  };

  // 5. Load History
  const handleToggleHistory = async () => {
    if (!showHistory) {
      setHistoryLoading(true);
      try {
        const data = await streakApi.getHistory();
        setHistoryData(data);
      } catch (e) {
        console.error('Failed to load history:', e);
      } finally {
        setHistoryLoading(false);
      }
    }
    setShowHistory(!showHistory);
  };

  // 6. Developer Simulator Handler
  const handleDevAction = async (action, extra = {}) => {
    try {
      const res = await streakApi.simulateTimeShift(action, extra);
      setStreakData(res.refreshedState);
      if (res.refreshedState.nextClaimAt) {
        const serverMs = new Date(res.refreshedState.serverTime).getTime();
        const nextMs = new Date(res.refreshedState.nextClaimAt).getTime();
        setCooldownSeconds(Math.max(0, Math.floor((nextMs - serverMs) / 1000)));
      } else {
        setCooldownSeconds(0);
      }
      showToast(`Applied Simulation: ${action}`, 'info');
      if (showHistory) handleToggleHistory();
    } catch (e) {
      showToast(`Simulation failed: ${e.message}`, 'danger');
    }
  };

  const day7Config = streakData?.rewards?.find((r) => r.day === 7);

  return (
    <div className={styles.container}>
      {/* Top Navbar */}
      <Navbar
        wallet={streakData?.wallet}
        streakCount={streakData?.currentStreak || 0}
        user={streakData?.user}
      />

      {/* Floating Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '24px',
            zIndex: 9999,
            backgroundColor:
              toastMessage.type === 'success'
                ? '#064e3b'
                : toastMessage.type === 'danger'
                ? '#7f1d1d'
                : toastMessage.type === 'warning'
                ? '#78350f'
                : '#1e1b4b',
            border: `1px solid ${
              toastMessage.type === 'success'
                ? '#10b981'
                : toastMessage.type === 'danger'
                ? '#ef4444'
                : toastMessage.type === 'warning'
                ? '#f59e0b'
                : '#6366f1'
            }`,
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '6px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.82rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {toastMessage.type === 'success' && <CheckCircle size={16} color="#10b981" />}
          {toastMessage.type === 'warning' && <ShieldAlert size={16} color="#f59e0b" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <main className={styles.mainContent}>
        {/* System Telemetry Bar */}
        <div className={styles.topBar}>
          <div className={styles.systemStatus}>
            <span className={styles.statusIndicator} />
            <span>CORE PROTOCOL ONLINE • SERVER TIME SYNCED</span>
          </div>
          <div className={styles.serverTimePill}>
            <Clock size={13} color="#94a3b8" />
            <span>
              {streakData?.serverTime
                ? new Date(streakData.serverTime).toUTCString().replace('GMT', 'UTC')
                : 'SYNCHRONIZING...'}
            </span>
          </div>
        </div>

        {loading ? (
          <StreakLoader message="Connecting to authoritative ledger..." />
        ) : error ? (
          <div className="text-center py-5">
            <div className="alert alert-danger d-inline-block px-4 py-3 rounded-2">
              <h6 className="mb-2 font-weight-bold">Connection Failed</h6>
              <p className="small mb-3">{error}</p>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => loadStreakState(true)}
              >
                <RefreshCw size={14} className="me-1" /> Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Executive Hero Banner */}
            <HeroBanner
              currentStreak={streakData.currentStreak}
              isEligibleToClaim={streakData.isEligibleToClaim}
              currentDay={streakData.currentDay}
              cooldownSeconds={cooldownSeconds}
              cycleId={streakData.cycleId}
            />

            {/* Metrics & Progression Matrix */}
            <StreakStats
              streakCount={streakData.currentStreak}
              checkedInCount={streakData.checkedInCount}
              totalRewards={streakData.totalRewards}
              wallet={streakData.wallet}
              rewards={streakData.rewards}
            />

            {/* Asymmetric 2-Column Rewards Matrix */}
            <div className={styles.layoutMatrix}>
              {/* Left: 6-Day Primary Grid */}
              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeading}>
                    <span>Weekly Rewards Matrix (Days 1–6)</span>
                  </div>
                  <button
                    className="btn btn-sm btn-dark border-secondary border-opacity-50 text-secondary"
                    onClick={() => loadStreakState(false)}
                    style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <RefreshCw size={12} className="me-1" /> Refresh
                  </button>
                </div>

                <RewardGrid
                  rewards={streakData.rewards}
                  onClaim={handleInitiateClaim}
                  isClaiming={isClaiming}
                  cooldownSeconds={cooldownSeconds}
                />
              </div>

              {/* Right: Day 7 Grand Finale Milestone Card */}
              <div>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionHeading}>
                    <span>Milestone Settlement</span>
                  </div>
                </div>

                <UltimateReward
                  day7Config={day7Config}
                  onClaim={handleInitiateClaim}
                  isEligible={streakData.isEligibleToClaim}
                  currentStreak={streakData.currentStreak}
                />
              </div>
            </div>

            {/* Developer QA & Anti-Cheat Simulation Console */}
            <div className={styles.devPanel}>
              <div className={styles.devPanelHeader}>
                <div className={styles.devTitle}>
                  <Terminal size={15} color="#818cf8" />
                  <span>Developer & QA Verification Sandbox</span>
                </div>
                <button
                  className={styles.devButton}
                  onClick={handleToggleHistory}
                >
                  <History size={13} className="me-1" />
                  <span>{showHistory ? 'Hide Ledger Statements' : 'View Financial Ledger Audit'}</span>
                </button>
              </div>

              <div className={styles.devBtnGroup}>
                <button
                  className={styles.devButton}
                  onClick={() => handleDevAction('FAST_FORWARD_24H')}
                >
                  Fast-Forward 24h (Unlock Cooldown)
                </button>

                <button
                  className={styles.devButton}
                  onClick={() => handleDevAction('SIMULATE_MISSED_DAY')}
                  style={{ borderColor: '#7f1d1d', color: '#fca5a5' }}
                >
                  Simulate Missed Day (48h+ Inactivity Reset)
                </button>

                <button
                  className={styles.devButton}
                  onClick={() => handleDevAction('SET_STREAK', { targetStreak: 6 })}
                >
                  Set Streak to Day 6 (Test Grand Prize)
                </button>

                <button
                  className={styles.devButton}
                  onClick={() => handleDevAction('RESET_TO_DAY_ONE')}
                >
                  Reset Streak to Day 1
                </button>
              </div>

              {/* Collapsible Ledger / Audit Trail Table */}
              {showHistory && (
                <div className="mt-3 pt-3 border-top border-secondary border-opacity-25">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#94a3b8' }}>
                      IMMUTABLE FINANCIAL TRANSACTION AUDIT TRAIL
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#64748b' }}>
                      TOTAL RECORDS: {historyData?.transactions?.length || 0}
                    </span>
                  </div>

                  {historyLoading ? (
                    <div className="text-secondary small py-2">Loading statements...</div>
                  ) : historyData?.transactions?.length === 0 ? (
                    <div className="text-secondary small py-2">No transaction records logged in this session yet.</div>
                  ) : (
                    <table className={styles.ledgerTable}>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Currency</th>
                          <th>Amount</th>
                          <th>Before</th>
                          <th>After</th>
                          <th>Source</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData?.transactions?.map((tx) => (
                          <tr key={tx._id}>
                            <td>{new Date(tx.createdAt).toLocaleTimeString()}</td>
                            <td><span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{tx.currency}</span></td>
                            <td style={{ color: '#10b981', fontWeight: 600 }}>+{tx.amount}</td>
                            <td>{tx.balanceBefore}</td>
                            <td>{tx.balanceAfter}</td>
                            <td><code>{tx.source}</code></td>
                            <td>{tx.metadata?.description || 'Daily Streak Reward'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* CPA Settlement & Verification Modal */}
      <CpaDemoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setClaimSuccessData(null);
        }}
        day={selectedClaimDay}
        rewardInfo={streakData?.rewards?.find((r) => r.day === selectedClaimDay)}
        onConfirmClaim={handleConfirmClaim}
        isProcessing={isClaiming}
        claimSuccessData={claimSuccessData}
      />
    </div>
  );
};

export default DailyStreakPage;
