# VELoop Rewards - Daily Streak API Documentation

## Overview
The **VELoop Daily Streak & Rewards Engine** operates on a **Server-Authoritative, Zero-Trust Architecture**. The client device clock is strictly ignored; all status calculations, cooldowns, and reward entitlements are derived from cryptographic server timestamps and atomic database transactions.

---

## Base URL
- **Local Development:** `http://localhost:5001/api`
- **Frontend Proxy:** `http://localhost:5173/api`

---

## Authentication
Requests accept standard JSON Web Tokens via the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```
*Note: During local evaluation, if no token or an invalid token is provided, the backend automatically attaches a sandbox demo account (`demo@veloop.io`) to enable instant zero-config exploration.*

---

## API Endpoints Reference

### 1. Retrieve Daily Streak State
Retrieves the user's complete streak status, server timestamp, 24h countdown parameters, and the 7-day reward cards array.

- **Method:** `GET`
- **Path:** `/api/daily-streak`
- **Headers:** `Authorization: Bearer <token>`

#### Successful Response (`200 OK`)
```json
{
  "success": true,
  "user": {
    "id": "67027c8a3298a0021b01c384",
    "name": "Alex Hunter",
    "email": "demo@veloop.io",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
  },
  "currentStreak": 2,
  "currentDay": 3,
  "checkedInCount": 2,
  "totalRewards": 7,
  "isEligibleToClaim": true,
  "serverTime": "2026-10-06T11:15:30.124Z",
  "nextClaimAt": null,
  "cooldownRemainingMs": 0,
  "cycleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "streakStatus": "ACTIVE",
  "stateResetOccurred": false,
  "rewards": [
    {
      "day": 1,
      "title": "Day 1 Starter",
      "subtitle": "+20 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 20,
      "formattedReward": "+20 VES",
      "icon": "/assets/purple-giftbox.png",
      "badgeText": "KICKSTART",
      "isMilestone": false,
      "isUltimateReward": false,
      "status": "CLAIMED",
      "claimedAt": "2026-10-04T10:00:00.000Z"
    },
    {
      "day": 2,
      "title": "Day 2 Momentum",
      "subtitle": "+40 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 40,
      "formattedReward": "+40 VES",
      "icon": "/assets/purple-giftbox.png",
      "badgeText": "2X BOOST",
      "isMilestone": false,
      "isUltimateReward": false,
      "status": "CLAIMED",
      "claimedAt": "2026-10-05T10:30:00.000Z"
    },
    {
      "day": 3,
      "title": "Day 3 Growth Boost",
      "subtitle": "+75 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 75,
      "formattedReward": "+75 VES",
      "icon": "/assets/growth-arrow.png",
      "badgeText": "3-DAY STREAK",
      "isMilestone": true,
      "isUltimateReward": false,
      "status": "AVAILABLE",
      "claimedAt": null
    },
    {
      "day": 4,
      "title": "Day 4 Midpoint",
      "subtitle": "+100 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 100,
      "formattedReward": "+100 VES",
      "icon": "/assets/purple-giftbox.png",
      "badgeText": "HALF-WAY",
      "isMilestone": false,
      "isUltimateReward": false,
      "status": "LOCKED",
      "claimedAt": null
    },
    {
      "day": 5,
      "title": "Day 5 Surge",
      "subtitle": "+150 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 150,
      "formattedReward": "+150 VES",
      "icon": "/assets/growth-arrow.png",
      "badgeText": "MAJOR SURGE",
      "isMilestone": true,
      "isUltimateReward": false,
      "status": "LOCKED",
      "claimedAt": null
    },
    {
      "day": 6,
      "title": "Day 6 Mystery Box",
      "subtitle": "+200 VES Coins",
      "rewardType": "VES",
      "rewardAmount": 200,
      "formattedReward": "+200 VES",
      "icon": "/assets/reward-box-open.jpg",
      "badgeText": "EVE OF GLORY",
      "isMilestone": false,
      "isUltimateReward": false,
      "status": "LOCKED",
      "claimedAt": null
    },
    {
      "day": 7,
      "title": "Day 7 Ultimate Reward",
      "subtitle": "₹500 Amazon Voucher + 500 VES",
      "rewardType": "INR_GIFTCARD",
      "rewardAmount": 500,
      "formattedReward": "₹500 Amazon Gift Card",
      "icon": "/assets/ultimate-reward-crown.jpg",
      "badgeText": "👑 ULTIMATE REWARD",
      "isMilestone": true,
      "isUltimateReward": true,
      "status": "LOCKED",
      "claimedAt": null
    }
  ],
  "wallet": {
    "ves": 350,
    "inrGiftCard": 0,
    "mysteryBoxes": 0,
    "totalEstimatedValueInr": 35.0
  }
}
```

---

### 2. Claim Daily Reward
Executes atomic claim for the active day. Employs unique compound index `{ userId, cycleId, day }` and strict server-time verification.

- **Method:** `POST`
- **Path:** `/api/daily-streak/claim`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Body:**
```json
{
  "day": 3
}
```

#### Successful Claim Response (`200 OK`)
```json
{
  "success": true,
  "message": "Congratulations! Day 3 reward of +75 VES claimed successfully!",
  "claimedReward": {
    "day": 3,
    "title": "Day 3 Growth Boost",
    "subtitle": "+75 VES Coins",
    "rewardType": "VES",
    "rewardAmount": 75,
    "formattedReward": "+75 VES",
    "isMilestone": true,
    "isUltimateReward": false,
    "claimedAt": "2026-10-06T11:16:00.000Z"
  },
  "transaction": {
    "id": "67027cf83298a0021b01c390",
    "balanceBefore": 350,
    "balanceAfter": 425,
    "currency": "VES"
  },
  "refreshedState": { ... }
}
```

#### Cooldown Active Error (`429 Too Many Requests`)
```json
{
  "success": false,
  "code": "COOLDOWN_ACTIVE",
  "message": "Daily reward cooldown is active. Please wait for the 24-hour cycle timer.",
  "nextClaimAt": "2026-10-07T11:16:00.000Z"
}
```

#### Out-of-Sequence Error (`400 Bad Request`)
```json
{
  "success": false,
  "code": "INVALID_DAY_SEQUENCE",
  "message": "Invalid claim progression. Expected Day 3, but Day 6 was requested."
}
```

#### Duplicate Claim Concurrency Conflict (`409 Conflict`)
```json
{
  "success": false,
  "code": "DUPLICATE_CLAIM",
  "message": "Day 3 reward has already been claimed for this cycle."
}
```

---

### 3. Claim & Ledger History
Retrieves all historical streak claims, financial wallet transactions, and security audit logs.

- **Method:** `GET`
- **Path:** `/api/daily-streak/history?limit=20`

---

### 4. QA Simulation Sandbox Endpoint
Allows QA engineers and developers to test temporal edge cases (simulating clock leaps, missed days, etc.).

- **Method:** `POST`
- **Path:** `/api/daily-streak/dev-simulate`
- **Body Options:**
  - Fast-forward 24 hours: `{"action": "FAST_FORWARD_24H"}`
  - Simulate Missed Day (>48 hours inactive): `{"action": "SIMULATE_MISSED_DAY"}`
  - Jump to Day 6: `{"action": "SET_STREAK", "targetStreak": 6}`
  - Reset to Day 1: `{"action": "RESET_TO_DAY_ONE"}`

---

## cURL Commands for Testing

```bash
# 1. Fetch Streak State
curl -X GET http://localhost:5001/api/daily-streak

# 2. Claim Day 1 Reward
curl -X POST http://localhost:5001/api/daily-streak/claim \
  -H "Content-Type: application/json" \
  -d '{"day": 1}'

# 3. Simulate Fast-Forwarding 24h
curl -X POST http://localhost:5001/api/daily-streak/dev-simulate \
  -H "Content-Type: application/json" \
  -d '{"action": "FAST_FORWARD_24H"}'

# 4. View Audit Log History
curl -X GET http://localhost:5001/api/daily-streak/history
```
