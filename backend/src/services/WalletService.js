const { User, Transaction, sequelize } = require('../models');

class WalletService {
  async getBalance(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
    return { balance: user.wallet_balance || 0 };
  }

  async topUp(userId, amount, provider = 'MOMO') {
    if (amount < 100) throw Object.assign(new Error('Minimum top up is 100 FCFA'), { statusCode: 400 });
    
    // Simulate API delay for MoMo/Campay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const t = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId, { transaction: t });
      user.wallet_balance = (user.wallet_balance || 0) + amount;
      await user.save({ transaction: t });

      const transaction = await Transaction.create({
        user_id: userId,
        amount,
        type: 'TOP_UP',
        status: 'COMPLETED',
        reference: `MOCK_${provider}_${Date.now()}`
      }, { transaction: t });

      await t.commit();
      return { balance: user.wallet_balance, transaction };
    } catch (error) {
      await t.rollback();
      throw Object.assign(new Error('Top up failed'), { statusCode: 500 });
    }
  }

  async getHistory(userId) {
    return await Transaction.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new WalletService();
