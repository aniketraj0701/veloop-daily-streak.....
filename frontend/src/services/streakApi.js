import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to inject token if stored
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const streakApi = {
  /**
   * Fetch complete authoritative streak state from server
   */
  async getStreakState() {
    const response = await apiClient.get('/daily-streak');
    return response.data;
  },

  /**
   * Claim daily streak reward for the expected day
   */
  async claimStreak(day) {
    const response = await apiClient.post('/daily-streak/claim', { day });
    return response.data;
  },

  /**
   * Get user's rewards and wallet transaction history
   */
  async getHistory() {
    const response = await apiClient.get('/daily-streak/history');
    return response.data;
  },

  /**
   * Testing helper to simulate time/streak manipulation for QA & anti-cheat verification
   */
  async simulateTimeShift(action, extra = {}) {
    const response = await apiClient.post('/daily-streak/dev-simulate', {
      action,
      ...extra,
    });
    return response.data;
  },
};

export default streakApi;
