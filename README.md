# 🚀 VELoop Rewards - Daily Streak & Loyalty System

> A production-grade, server-authoritative, zero-trust Daily Streak and Loyalty Gamification platform engineered with the MERN stack (MongoDB, Express, React, Node.js).

---

## 🌟 Key Features

- ⚡ **Server-Authoritative Time & Cooldowns:** 24-hour waiting periods and 48-hour execution grace windows are enforced exclusively by the server. Client device clock changes have zero effect.
- 🛡️ **Race-Condition & Idempotency Protection:** Enforced via MongoDB unique compound indexes (`userId` + `cycleId` + `day`) to block concurrent double-claiming attempts.
- 💰 **Immutable Financial Ledger:** Every reward credits the user's multi-currency wallet (`VES` coins and `INR_GIFTCARD`) with double-entry audit records capturing `balanceBefore`, `balanceAfter`, and claim references.
- 👑 **7-Day Progression & Ultimate Milestone:** Visual progression track across Days 1–7 culminating in the grand **₹500 Amazon Gift Card** ultimate reward.
- 🎨 **VELoop Cybernetic Dark Visual Language:** Styled with CSS Modules, Bootstrap 5, glowing glassmorphism, Framer Motion transitions, and confetti celebrations.
- 🧪 **Developer & QA Sandbox:** Built-in interactive dev panel to simulate time leaps, test missed-day resets, test day jumps, and inspect real-time transaction statements.

---

## 📁 Project Architecture

```
veloop-daily-streak/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB connection with auto-memory fallback
│   ├── models/
│   │   ├── User.js               # User model with streak metadata & JWT helper
│   │   ├── Wallet.js             # Multi-currency wallet ledger
│   │   ├── StreakConfig.js       # Day 1-7 reward definitions
│   │   ├── StreakClaim.js        # Claims with unique compound index {userId, cycleId, day}
│   │   ├── WalletTransaction.js  # Immutable financial audit transactions
│   │   └── AuditLog.js           # Security tracking & anti-cheat audit logs
│   ├── middleware/
│   │   ├── auth.js               # JWT bearer authentication & demo bootstrap
│   │   └── errorHandler.js       # Centralized error handler
│   ├── services/
│   │   ├── streak.service.js     # Core streak calculation & atomic claim logic
│   │   └── wallet.service.js     # Ledger credit & balance calculations
│   ├── controllers/
│   │   └── streak.controller.js  # API request controllers
│   ├── routes/
│   │   └── streak.routes.js      # Express route definitions & rate limiters
│   ├── seed/
│   │   └── seedRewards.js        # Seed script for initial 7-day reward configuration
│   ├── .env.example
│   └── server.js                 # Server entrypoint
├── frontend/
│   ├── public/
│   │   └── assets/               # High-res VELoop reward icons & artwork
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Top navigation with live balance pills
│   │   │   ├── HeroBanner.jsx    # Streak hero banner
│   │   │   ├── StreakStats.jsx   # 4-card statistics & 7-node step tracker
│   │   │   ├── UltimateReward.jsx# Day 7 Amazon crown grand banner
│   │   │   ├── RewardCard.jsx    # Day reward card with live countdown timer
│   │   │   ├── RewardGrid.jsx    # Responsive grid layout
│   │   │   ├── CpaDemoModal.jsx  # Security verification & confetti modal
│   │   │   ├── StreakLoader.jsx  # Branded initial loader
│   │   │   └── StreakSkeleton.jsx# Glowing skeleton placeholder
│   │   ├── pages/
│   │   │   └── DailyStreakPage.jsx # Main dashboard controller
│   │   ├── styles/
│   │   │   ├── DailyStreak.module.css
│   │   │   └── RewardCard.module.css
│   │   ├── services/
│   │   │   └── streakApi.js      # Axios client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── API_DOCUMENTATION.md      # API specification & cURL scripts
│   ├── TESTING.md                # Anti-cheat adversarial test suites
│   └── SECURITY.md               # Threat modeling & security architecture
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (optional - backend automatically spins up embedded in-memory MongoDB if no local instance is found)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev   # Or npm start
```
*Backend runs on `http://localhost:5001`.*

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Testing & Anti-Cheat Validation
Refer to [`docs/TESTING.md`](./docs/TESTING.md) for full instructions on verifying:
- **Clock Tampering Resistance:** Modifying client device clock does not bypass the 24-hour server cooldown.
- **Race Condition Resistance:** Concurrent double-claiming requests are blocked by the compound index.
- **Missed Day Auto-Reset:** Simulating 48h+ inactivity resets the streak to Day 1 with audit logs.
- **Out-of-Sequence Rejection:** Skipping ahead to Day 7 triggers a `400 Bad Request`.

---

## 📜 Documentation Index
- [API Documentation (`docs/API_DOCUMENTATION.md`)](./docs/API_DOCUMENTATION.md)
- [Testing & Anti-Cheat Guide (`docs/TESTING.md`)](./docs/TESTING.md)
- [Security Architecture (`docs/SECURITY.md`)](./docs/SECURITY.md)
