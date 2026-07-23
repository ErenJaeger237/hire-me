const { Message, Booking, User, ProviderProfile } = require('../models');

class MessageService {
  async getMessages(userId, bookingId) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: ProviderProfile, as: 'provider' }
      ]
    });

    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    
    const isClient = booking.client_id === userId;
    const isProvider = booking.provider.user_id === userId;

    if (!isClient && !isProvider) {
      throw Object.assign(new Error('Unauthorized to view these messages'), { statusCode: 403 });
    }

    const messages = await Message.findAll({
      where: { booking_id: bookingId },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'profile_picture_url'] }
      ]
    });

    const unreadMessageIds = messages
      .filter(m => m.sender_id !== userId && !m.is_read)
      .map(m => m.id);
      
    if (unreadMessageIds.length > 0) {
      await Message.update(
        { is_read: true },
        { where: { id: unreadMessageIds } }
      );
    }

    return messages;
  }

  async sendMessage(userId, bookingId, content) {
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: ProviderProfile, as: 'provider' }
      ]
    });

    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    
    const isClient = booking.client_id === userId;
    const isProvider = booking.provider.user_id === userId;

    if (!isClient && !isProvider) {
      throw Object.assign(new Error('Unauthorized to send messages for this booking'), { statusCode: 403 });
    }

    const message = await Message.create({
      booking_id: bookingId,
      sender_id: userId,
      content,
    });

    // Return with sender details so frontend can identify the author
    const fullMessage = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'profile_picture_url'] }]
    });

    return fullMessage;
  }
}

module.exports = new MessageService();
