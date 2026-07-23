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
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
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
}

module.exports = new AdminService();
