const { Booking, ProviderProfile, User } = require('../models');
const { Op } = require('sequelize');

class BookingService {
  async createBooking(clientId, { providerId, date, description, hours }) {
    const providerProfile = await ProviderProfile.findByPk(providerId);
    if (!providerProfile) {
      throw Object.assign(new Error('Service Provider profile not found.'), { statusCode: 404 });
    }

    const { sequelize, Transaction } = require('../models');
    const t = await sequelize.transaction();

    try {
      const client = await User.findByPk(clientId, { transaction: t });
      
      const estimatedHours = Number(hours) || 1;
      const hourlyRate = Number(providerProfile.hourly_rate);
      const bookingFee = hourlyRate * estimatedHours;

      if (Number(client.wallet_balance || 0) < bookingFee) {
        throw Object.assign(new Error(`Insufficient FCFA balance. Minimum required: ${bookingFee} FCFA (for ${estimatedHours} hours). Please top up your wallet.`), { statusCode: 400 });
      }

      client.wallet_balance = Number(client.wallet_balance || 0) - bookingFee;
      await client.save({ transaction: t });

      const newBooking = await Booking.create({
        client_id: clientId,
        provider_id: providerId,
        job_date: new Date(date),
        description: description || '',
        status: 'PENDING',
        estimated_hours: estimatedHours,
      }, { transaction: t });

      await Transaction.create({
        user_id: clientId,
        amount: -bookingFee,
        type: 'ESCROW_HOLD',
        status: 'COMPLETED',
        reference: `BOOKING_${newBooking.id}`
      }, { transaction: t });

      await t.commit();

      return {
        message: 'Booking request sent and funds held in escrow.',
        bookingId: newBooking.id,
        booking: newBooking,
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }



  async getBookings(userId, userRole, { page = 1, limit = 20 }) {
    let whereClause = {};

    if (userRole === 'CLIENT') {
      whereClause = { client_id: userId };
    } else if (userRole === 'PROVIDER') {
      const profile = await ProviderProfile.findOne({ where: { user_id: userId } });
      if (!profile) {
        return { bookings: [], pagination: { total: 0, page: 1, limit: parseInt(limit), totalPages: 0 } };
      }
      whereClause = { provider_id: profile.id };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'email', 'profile_picture_url'] },
        {
          model: ProviderProfile,
          as: 'provider',
          include: [{ model: User, as: 'user', attributes: ['name', 'email', 'profile_picture_url'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return {
      bookings,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    };
  }

  async updateBookingStatus(bookingId, status, requestingUserId, requestingUserRole) {
    const { sequelize, Transaction } = require('../models');
    const t = await sequelize.transaction();

    try {
      const booking = await Booking.findByPk(bookingId, { 
        include: [{ model: ProviderProfile, as: 'provider' }],
        transaction: t 
      });

      if (!booking) {
        throw Object.assign(new Error('Booking not found.'), { statusCode: 404 });
      }

      const VALID_TRANSITIONS = {
        PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
        ACCEPTED: ['COMPLETED', 'DISPUTED', 'CANCELLED'],
        DISPUTED: ['COMPLETED', 'REJECTED'], // Admin resolves dispute
      };

      if (!VALID_TRANSITIONS[booking.status]?.includes(status)) {
        throw Object.assign(new Error(`Invalid transition: ${booking.status} -> ${status}`), { statusCode: 400 });
      }

      if (requestingUserRole === 'PROVIDER') {
        const profile = await ProviderProfile.findOne({ where: { user_id: requestingUserId } });
        if (!profile || booking.provider_id !== profile.id) {
          throw Object.assign(new Error('Forbidden: You do not own this booking.'), { statusCode: 403 });
        }
        if (!['ACCEPTED', 'REJECTED', 'DISPUTED'].includes(status)) {
           throw Object.assign(new Error('Providers cannot force completion or arbitrary states.'), { statusCode: 403 });
        }
      }
      
      if (requestingUserRole === 'CLIENT') {
        if (booking.client_id !== requestingUserId) {
          throw Object.assign(new Error('Forbidden.'), { statusCode: 403 });
        }
        if (!['COMPLETED', 'DISPUTED', 'CANCELLED'].includes(status)) {
          throw Object.assign(new Error('Clients can only mark jobs as Completed, Disputed, or Cancelled.'), { statusCode: 403 });
        }
      }

      if (requestingUserRole === 'ADMIN') {
        // Admins can only resolve disputes
        if (booking.status !== 'DISPUTED') {
          throw Object.assign(new Error('Admins can only transition DISPUTED bookings.'), { statusCode: 403 });
        }
      }

      const bookingFee = Number(booking.provider.hourly_rate) * Number(booking.estimated_hours || 1);

      if (status === 'REJECTED') {
        // Refund client
        const client = await User.findByPk(booking.client_id, { transaction: t });
        client.wallet_balance = Number(client.wallet_balance || 0) + bookingFee;
        await client.save({ transaction: t });

        await Transaction.create({
          user_id: client.id,
          amount: bookingFee,
          type: 'ESCROW_REFUND',
          status: 'COMPLETED',
          reference: `REFUND_${booking.id}`
        }, { transaction: t });
      } else if (status === 'COMPLETED') {
        // Pay provider (95% payout, 5% platform fee)
        const platformFee = bookingFee * 0.05;
        const providerPayout = bookingFee - platformFee;

        const providerUser = await User.findByPk(booking.provider.user_id, { transaction: t });
        providerUser.wallet_balance = Number(providerUser.wallet_balance || 0) + providerPayout;
        await providerUser.save({ transaction: t });

        await Transaction.create({
          user_id: providerUser.id,
          amount: providerPayout,
          type: 'PAYMENT_RECEIVED',
          status: 'COMPLETED',
          reference: `PAYMENT_${booking.id}`
        }, { transaction: t });

        // Record platform fee (associated with the client or provider? Let's use the provider's ID to keep the books balanced)
        await Transaction.create({
          user_id: providerUser.id,
          amount: platformFee,
          type: 'PLATFORM_FEE',
          status: 'COMPLETED',
          reference: `FEE_${booking.id}`
        }, { transaction: t });
      }

      if (status === 'CANCELLED') {
        const hourlyRate = Number(booking.provider.hourly_rate);
        const estimatedHours = Number(booking.estimated_hours || 1);
        const bookingFee = hourlyRate * estimatedHours;

        const clientUser = await User.findByPk(booking.client_id, { transaction: t });
        clientUser.wallet_balance = Number(clientUser.wallet_balance || 0) + bookingFee;
        await clientUser.save({ transaction: t });

        await Transaction.create({
          user_id: booking.client_id,
          amount: bookingFee,
          type: 'ESCROW_REFUND',
          status: 'COMPLETED',
          reference: `BOOKING_CANCEL_${booking.id}`
        }, { transaction: t });
      }

      booking.status = status;
      await booking.save({ transaction: t });

      await t.commit();
      return {
        message: `Booking status updated to ${status}.`,
        booking,
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async addReview(clientId, bookingId, { rating, reviewText }) {
    const booking = await Booking.findOne({
      where: { id: bookingId, client_id: clientId, status: 'COMPLETED' },
    });

    if (!booking) {
      throw Object.assign(new Error('Completed booking not found.'), { statusCode: 404 });
    }

    booking.rating = rating;
    booking.review_text = reviewText;
    await booking.save();

    // Update the ProviderProfile average rating
    const providerId = booking.provider_id;
    const allProviderBookings = await Booking.findAll({
      where: { provider_id: providerId, rating: { [Op.not]: null } }
    });

    if (allProviderBookings.length > 0) {
      const sum = allProviderBookings.reduce((acc, b) => acc + b.rating, 0);
      const newAverage = sum / allProviderBookings.length;
      
      const profile = await ProviderProfile.findByPk(providerId);
      if (profile) {
        profile.rating = newAverage;
        await profile.save();
      }
    }

    return {
      message: 'Review submitted successfully.',
      booking,
    };
  }
}

module.exports = new BookingService();
