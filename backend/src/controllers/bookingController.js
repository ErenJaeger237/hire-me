const { Booking, ProviderProfile, User } = require('../models');

async function createBooking(req, res) {
  try {
    const clientId = req.user.id;
    const { providerId, date, description } = req.body;

    if (!providerId || !date) {
      return res.status(400).json({ error: 'providerId and date are required.' });
    }

    const providerProfile = await ProviderProfile.findByPk(providerId);
    if (!providerProfile) {
      return res.status(404).json({ error: 'Service Provider profile not found.' });
    }

    const newBooking = await Booking.create({
      client_id: clientId,
      provider_id: providerId,
      job_date: new Date(date),
      description: description || '',
      status: 'PENDING',
    });

    return res.status(201).json({
      message: 'Booking request sent successfully.',
      bookingId: newBooking.id,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({ error: 'Failed to create booking.' });
  }
}

async function getBookings(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};

    if (userRole === 'CLIENT') {
      whereClause = { client_id: userId };
    } else if (userRole === 'PROVIDER') {
      const profile = await ProviderProfile.findOne({ where: { user_id: userId } });
      if (!profile) {
        return res.status(200).json([]);
      }
      whereClause = { provider_id: profile.id };
    }

    const bookings = await Booking.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'client', attributes: ['id', 'name', 'email'] },
        {
          model: ProviderProfile,
          as: 'provider',
          include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch Bookings Error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
}

async function updateBookingStatus(req, res) {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status update.' });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (error) {
    console.error('Update Booking Error:', error);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  }
}

async function addReview(req, res) {
  try {
    const bookingId = req.params.id;
    const { rating, reviewText } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, client_id: req.user.id, status: 'COMPLETED' },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Completed booking not found.' });
    }

    booking.rating = rating;
    booking.review_text = reviewText;
    await booking.save();

    return res.status(200).json({
      message: 'Review submitted successfully.',
      booking,
    });
  } catch (error) {
    console.error('Add Review Error:', error);
    return res.status(500).json({ error: 'Failed to submit review.' });
  }
}

module.exports = { createBooking, getBookings, updateBookingStatus, addReview };
