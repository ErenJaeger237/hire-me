const messageService = require('../services/MessageService');
const { sendMessageSchema } = require('../validators/messageValidator');

class MessageController {
  async getMessages(req, res) {
    try {
      const { bookingId } = req.params;
      const result = await messageService.getMessages(req.user.id, bookingId);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to fetch messages' });
    }
  }

  async sendMessage(req, res) {
    try {
      const { bookingId } = req.params;
      const validatedData = sendMessageSchema.parse(req.body);
      const result = await messageService.sendMessage(req.user.id, bookingId, validatedData.content);
      
      const io = req.app.get('io');
      if (io) {
        // We emit the new message to everyone in the room except the sender
        // But since we just want to broadcast, we can send it to the whole room
        io.to(`booking_${bookingId}`).emit('new_message', result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      res.status(error.statusCode || 500).json({ error: error.message || 'Failed to send message' });
    }
  }
}

module.exports = new MessageController();
