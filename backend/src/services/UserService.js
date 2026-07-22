const { User, ProviderProfile, Booking, Message } = require('../models');
const { Op } = require('sequelize');

class UserService {
  async getNotifications(userId, role) {
    let pendingJobsCount = 0;
    
    if (role === 'PROVIDER') {
      const profile = await ProviderProfile.findOne({ where: { user_id: userId } });
      if (profile) {
        pendingJobsCount = await Booking.count({ 
          where: { provider_id: profile.id, status: 'PENDING' } 
        });
      }
    }

    let userBookings = [];
    if (role === 'CLIENT') {
      const bookings = await Booking.findAll({ where: { client_id: userId }, attributes: ['id'] });
      userBookings = bookings.map(b => b.id);
    } else {
      const profile = await ProviderProfile.findOne({ where: { user_id: userId } });
      if (profile) {
        const bookings = await Booking.findAll({ where: { provider_id: profile.id }, attributes: ['id'] });
        userBookings = bookings.map(b => b.id);
      }
    }

    let unreadMessagesCount = 0;
    if (userBookings.length > 0) {
      unreadMessagesCount = await Message.count({
        where: {
          booking_id: userBookings,
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      });
    }

    return {
      pendingJobs: pendingJobsCount,
      unreadMessages: unreadMessagesCount,
      total: pendingJobsCount + unreadMessagesCount
    };
  }

  async getProfile(userId, role) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
      include: role === 'PROVIDER' ? [{ model: ProviderProfile, as: 'profile' }] : [],
    });

    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { statusCode: 404 });
    }

    const { phone_number, profile_picture_url, location_text, location_lat, location_lng, resume_url, bio } = updateData;

    if (phone_number !== undefined) user.phone_number = phone_number;
    if (profile_picture_url !== undefined) user.profile_picture_url = profile_picture_url;
    if (location_text !== undefined) user.location_text = location_text;
    if (location_lat !== undefined) user.location_lat = location_lat;
    if (location_lng !== undefined) user.location_lng = location_lng;

    await user.save();

    if (user.role === 'PROVIDER') {
      const profile = await ProviderProfile.findOne({ where: { user_id: user.id } });
      if (profile) {
        if (resume_url !== undefined) profile.resume_url = resume_url;
        if (bio !== undefined) profile.bio = bio;
        await profile.save();
      }
    }

    return { message: 'Profile updated successfully', user };
  }
}

module.exports = new UserService();
