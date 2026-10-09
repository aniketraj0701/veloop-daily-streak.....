# VELoop Rewards - Security Architecture & Threat Model

## 1. Executive Security Summary
The **VELoop Rewards Daily Streak System** is engineered to withstand malicious tampering, clock manipulation, race-condition exploits, and unauthorized reward generation. It adheres to **Zero-Trust** design principles where the frontend React client is treated as completely untrusted.

---

## 2. Core Security Pillars

```
┌────────────────────────────────────────────────────────┐
│                   Untrusted Frontend                   │
│        (React View Layer • No Business Logic)          │
└──────────────────────────┬─────────────────────────────┘
                           │ Authenticated Request (JWT)
                           ▼
┌────────────────────────────────────────────────────────┐
│                  Security Middleware                   │
│  - Helmet HTTP Security Headers                        │
│  - IP Rate Limiting (express-rate-limit)               │
│  - JWT Verification & Identity Extraction              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Server-Authoritative Service             │
│  - Independent System Clock (Date.now())               │
│  - 24h Cooldown & 48h Grace Window Enforcement         │
│  - Strict Day Sequence Validation (N == Prev + 1)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Atomic Database Transactions               │
│  - MongoDB Compound Unique Index {userId, cycleId, day}│
│  - Immutable Double-Entry Wallet Ledger                │
│  - Tamper-Evident Audit Logging                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Threat Model & Mitigation Strategies

### Threat 1: Client System Time Spoofing
- **Vector:** A user manipulates their computer/phone system clock or timezone forward to bypass the 24-hour waiting period.
- **Mitigation:**
  - The client clock is NEVER used for validation.
  - The server derives all cooldowns from its internal `Date.now()`.
  - The frontend only receives `nextClaimAt` and calculates a local delta (`serverTime - clientTime`) strictly for displaying smooth cosmetic countdown numbers.

---

### Threat 2: Double-Claim Concurrency Attacks (Race Conditions)
- **Vector:** An attacker sends multiple simultaneous HTTP `POST` requests in milliseconds using automated tooling (e.g. Turbo Intruder, parallel cURL, Python scripts) hoping to claim the reward multiple times before the balance updates.
- **Mitigation:**
  - Database-enforced Unique Compound Index:
    ```javascript
    StreakClaimSchema.index({ userId: 1, cycleId: 1, day: 1 }, { unique: true });
    ```
  - If multiple threads attempt insertions concurrently, MongoDB allows exactly one write and immediately rejects all others with `E11000 Duplicate Key Error`.
  - The service layer catches `E11000`, logs a `DUPLICATE_CLAIM_ATTEMPT` security event, and returns `HTTP 409 Conflict`.

---

### Threat 3: Arbitrary Day Skipping (Privilege Escalation)
- **Vector:** A user tampers with the API payload to request Day 7 (₹500 Amazon Gift Card) directly on their first day (`{"day": 7}`).
- **Mitigation:**
  - The backend retrieves the user's persisted record directly from the database and calculates `expectedDay = currentStreak + 1`.
  - If `requestedDay !== expectedDay`, the claim is immediately aborted with `HTTP 400 INVALID_DAY_SEQUENCE` and recorded in `AuditLog`.

---

### Threat 4: Financial Balance Inconsistencies & Ghost Rewards
- **Vector:** An error occurs mid-claim, or balances get out of sync with claim records.
- **Mitigation:**
  - Immutable Financial Ledger (`WalletTransaction` model):
    - Every balance update logs `balanceBefore`, `balanceAfter`, `amount`, `currency`, `source: "DAILY_STREAK"`, and `referenceId` pointing to the `StreakClaim`.
  - Wallet balances can be audited and reconstructed at any time by summing all historical transactions.

---

## 4. Security Audit Logging
Every state mutation and rejected exploit attempt creates an immutable entry in `AuditLog`:

- `STREAK_CLAIM_SUCCESS`: Valid claim processed and wallet credited.
- `DUPLICATE_CLAIM_ATTEMPT`: Concurrent or repeat claim blocked by compound index.
- `INVALID_CLAIM_ATTEMPT`: Sequence jump or unauthorized day request blocked.
- `STREAK_RESET`: Automatic reset triggered due to expired grace window (>48h).
- `CLAIM_COOLDOWN_ACTIVE`: Early claim attempt blocked due to active 24h timer.
