const { Message, Booking, User, ProviderProfile } = require('../models');
const { Op } = require('sequelize');

const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Verify booking and access
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: ProviderProfile, as: 'provider' }
      ]
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const isClient = booking.client_id === req.user.userId;
    const isProvider = booking.provider.user_id === req.user.userId;

    if (!isClient && !isProvider) {
      return res.status(403).json({ error: 'Unauthorized to view these messages' });
    }

    if (booking.status !== 'ACCEPTED' && booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Messaging is only available for accepted or completed bookings.' });
    }

    const messages = await Message.findAll({
      where: { booking_id: bookingId },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profile_picture_url'] }
      ]
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    // Verify booking and access
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: ProviderProfile, as: 'provider' }
      ]
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const isClient = booking.client_id === req.user.userId;
    const isProvider = booking.provider.user_id === req.user.userId;

    if (!isClient && !isProvider) {
      return res.status(403).json({ error: 'Unauthorized to send messages for this booking' });
    }

    if (booking.status !== 'ACCEPTED' && booking.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Messaging is only available for accepted or completed bookings.' });
    }

    const message = await Message.create({
      booking_id: bookingId,
      sender_id: req.user.userId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
