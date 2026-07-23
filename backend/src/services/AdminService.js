const { User, ProviderProfile, Booking } = require('../models');

class AdminService {
  async getAnalytics() {
    const totalUsers = await User.count();
    const totalClients = await User.count({ where: { role: 'CLIENT' } });
    const totalProviders = await User.count({ where: { role: 'PROVIDER' } });
    const totalBookings = await Booking.count();
    const completedBookings = await Booking.count({ where: { status: 'COMPLETED' } });
    
    const activeBookingsList = await Booking.findAll({
      where: { status: ['PENDING', 'ACCEPTED'] },
      include: [{ model: ProviderProfile, as: 'provider', attributes: ['hourly_rate'] }]
    });
    const currentEscrow = activeBookingsList.reduce((sum, b) => sum + (Number(b.provider.hourly_rate) * Number(b.estimated_hours || 1)), 0);

    const completedBookingsList = await Booking.findAll({
      where: { status: 'COMPLETED' },
      include: [{ model: ProviderProfile, as: 'provider', attributes: ['hourly_rate'] }]
    });
    const totalProcessedVolume = completedBookingsList.reduce((sum, b) => sum + (Number(b.provider.hourly_rate) * Number(b.estimated_hours || 1)), 0);
    
    // Calculate actual collected revenue from transactions
    const { Transaction } = require('../models');
    const revenueSum = await Transaction.sum('amount', { where: { type: 'PLATFORM_FEE' } });
    const platformRevenue = revenueSum || 0;
    
    return {
      totalUsers,
      totalClients,
      totalProviders,
      totalBookings,
      completedBookings,
      currentEscrow,
      totalProcessedVolume,
      platformRevenue
    };
  }

  async getAllUsers() {
    return await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt', 'wallet_balance', 'is_banned'],
      order: [['createdAt', 'DESC']]
    });
  }

  async getAllProviders() {
    return await User.findAll({
      where: { role: 'PROVIDER' },
      include: [{
        model: ProviderProfile,
        as: 'profile',
        attributes: ['id', 'trade', 'hourly_rate', 'is_verified', 'verification_doc_url'],
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async verifyProvider(userId, isVerified) {
    const profile = await ProviderProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new Error('Provider profile not found');
    }
    profile.is_verified = isVerified;
    await profile.save();
    return profile;
  }

  async getProviders() {
    return await ProviderProfile.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] }
      ]
    });
  }

  async getDisputes() {
    return await Booking.findAll({
      where: { status: 'DISPUTED' },
      include: [
        { model: ProviderProfile, as: 'provider', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
      ]
    });
  }

  async banUser(userId, isBanned) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Protect other admins from being banned
    if (user.role === 'ADMIN' && isBanned) {
      throw new Error('Cannot ban another admin');
    }
    user.is_banned = isBanned;
    await user.save();
    return user;
  }

  async updateWallet(userId, amount, type) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (type === 'credit') {
      user.wallet_balance = parseFloat(user.wallet_balance) + amount;
    } else if (type === 'debit') {
      if (parseFloat(user.wallet_balance) < amount) {
        throw new Error('Insufficient funds in user wallet to debit this amount');
      }
      user.wallet_balance = parseFloat(user.wallet_balance) - amount;
    } else {
      throw new Error('Invalid transaction type. Must be credit or debit');
    }
    
    await user.save();
    return user;
  }
}

module.exports = new AdminService();
