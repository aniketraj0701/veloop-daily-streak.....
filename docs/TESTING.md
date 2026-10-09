# VELoop Rewards - Testing & Anti-Cheat Verification Guide

This guide details test suites and adversarial verification steps to validate the **Zero-Trust, Server-Authoritative Architecture** of the VELoop Daily Streak System.

---

## 1. Adversarial Anti-Cheat Test Matrix

| # | Attack Vector | Adversary Action | Expected System Defense | Result Code |
|---|---|---|---|---|
| **A1** | **Client Clock Tampering** | User alters OS / Device clock forward by 24h while cooldown is active. | Server enforces `serverTime` on backend; claim request rejected. | `429 COOLDOWN_ACTIVE` |
| **A2** | **Direct DevTools State Tampering** | Attacker modifies React state / un-disables "Claim" button via DOM inspection. | Backend independently verifies eligibility; rejects unauthorized claim. | `429 COOLDOWN_ACTIVE` |
| **A3** | **Sequential Progression Skip** | User sends payload `{"day": 7}` directly while on Day 1. | Backend validates `requestedDay === currentStreak + 1`; blocks skip. | `400 INVALID_DAY_SEQUENCE` |
| **A4** | **Concurrent Double-Claim Race Condition** | Attacker spams 10 parallel `POST /claim` requests at the exact same millisecond. | MongoDB unique compound index `{userId, cycleId, day}` allows 1 success and blocks 9 with duplicate conflict. | `409 DUPLICATE_CLAIM` |
| **A5** | **Missed-Day (>48h Inactivity)** | User fails to claim consecutive day within 48h execution window. | Backend detects expired grace window, resets streak to 0, logs `STREAK_RESET` audit event, and serves Day 1. | `200 RESET_TRIGGERED` |

---

## 2. Step-by-Step Anti-Cheat Verification Instructions

### Test 1: Device Clock Manipulation Resistance
1. Claim **Day 1** reward on the dashboard.
2. Observe that **Day 2** enters the 24-hour countdown cooldown.
3. Open your Mac/PC System Settings -> Date & Time -> Set date 2 days into the future.
4. Return to the browser.
5. Attempt to trigger the claim via DevTools or API:
   ```bash
   curl -X POST http://localhost:5001/api/daily-streak/claim \
     -H "Content-Type: application/json" \
     -d '{"day": 2}'
   ```
6. **Expected Output:** The backend calculates time using trusted server time (`Date.now()`), rejects the request with HTTP `429`, and logs `CLAIM_COOLDOWN_ACTIVE` to the Audit Log.

---

### Test 2: Concurrency & Double-Claim Race Condition Test
Run the following parallel curl script to fire 10 concurrent requests at once:

```bash
# Fire 10 simultaneous claim requests for Day 1
for i in {1..10}; do
  curl -s -X POST http://localhost:5001/api/daily-streak/claim \
    -H "Content-Type: application/json" \
    -d '{"day": 1}' &
done
wait
```

**Expected Verification:**
- Exactly **1 request** returns `HTTP 200 OK` (Claimed + Balance Credited).
- **9 requests** return `HTTP 409 Conflict` (`DUPLICATE_CLAIM`).
- Check the wallet ledger in Developer Sandbox: The user is credited **exactly once** (no duplicate coin inflation).

---

### Test 3: Out-of-Sequence Jumping Attempt
Attempt to claim the Day 7 ₹500 Amazon Gift Card without completing Days 1-6:

```bash
curl -X POST http://localhost:5001/api/daily-streak/claim \
  -H "Content-Type: application/json" \
  -d '{"day": 7}'
```

**Expected Verification:**
- Returns `HTTP 400 Bad Request`.
- Error message: `"Invalid claim progression. Expected Day 1, but Day 7 was requested."`
- AuditLog records `INVALID_CLAIM_ATTEMPT` with reason `OUT_OF_SEQUENCE_CLAIM_ATTEMPT`.

---

### Test 4: Missed-Day Auto-Reset Verification
1. Claim Day 1 and advance streak to Day 2 or 3.
2. In the Developer Sandbox panel at the bottom of the page, click **"⚠️ Simulate Missed Day (48h+ Inactivity Reset)"**.
3. Or trigger via API:
   ```bash
   curl -X POST http://localhost:5001/api/daily-streak/dev-simulate \
     -H "Content-Type: application/json" \
     -d '{"action": "SIMULATE_MISSED_DAY"}'
   ```
4. Query `/api/daily-streak`.
5. **Expected Verification:**
   - `currentStreak` is reset to `0`.
   - `streakStatus` transitions to `RESET`.
   - A new `cycleId` UUID is generated.
   - Day 1 becomes `AVAILABLE`.
   - An alert toast informs the user of the missed claim window reset.

---

### Test 5: Full 7-Day Cycle & Ultimate Reward Unlock
1. In the Dev Sandbox, click **"👑 Set Streak to Day 6 (Test Grand Prize)"**.
2. Click **"Fast-Forward 24h"** to unlock the cooldown.
3. Observe Day 7 card and the Ultimate Reward Crown banner highlight with gold halos.
4. Click **"Claim ₹500 Amazon Voucher Now!"**.
5. Watch the CPA verification animation and celebratory confetti burst.
6. Check the top navbar: The wallet now reflects `+₹500 Amazon Gift Card` and `+500 VES`!
