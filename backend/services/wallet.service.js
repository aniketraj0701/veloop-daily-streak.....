const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

class WalletService {
  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId, session = null) {
    let wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) {
      const created = await Wallet.create(
        [
          {
            userId,
            currencies: {
              VES: 0,
              INR_GIFTCARD: 0,
              MYSTERY_BOXES: 0,
            },
          },
        ],
        { session }
      );
      wallet = created[0];
    }
    return wallet;
  }

  /**
   * Credit wallet with audit trail and atomic updates
   */
  async creditReward({
    userId,
    currency,
    amount,
    source = 'DAILY_STREAK',
    referenceId = null,
    metadata = {},
    session = null,
  }) {
    const wallet = await this.getOrCreateWallet(userId, session);

    const currentBalance = wallet.currencies[currency] || 0;
    const newBalance = currentBalance + amount;

    // Update wallet balance
    wallet.currencies[currency] = newBalance;
    wallet.lastUpdatedBy = source;
    await wallet.save({ session });

    // Create immutable transaction ledger record
    const [tx] = await WalletTransaction.create(
      [
        {
          userId,
          currency,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          type: 'CREDIT',
          source,
          referenceId,
          metadata,
        },
      ],
      { session }
    );

    return {
      wallet,
      transaction: tx,
      balanceOverview: wallet.getOverview(),
    };
  }

  /**
   * Retrieve full wallet statement
   */
  async getWalletHistory(userId, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('referenceId');

    return {
      overview: wallet.getOverview(),
      transactions,
    };
  }
}

module.exports = new WalletService();
