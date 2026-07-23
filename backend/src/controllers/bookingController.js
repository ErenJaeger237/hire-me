const bookingService = require('../services/BookingService');
const { createBookingSchema, getBookingsSchema, updateBookingStatusSchema, addReviewSchema } = require('../validators/bookingValidator');

class BookingController {
  async createBooking(req, res) {
    try {
      const validatedData = createBookingSchema.parse(req.body);
      const result = await bookingService.createBooking(req.user.id, validatedData);
      
      // Emit socket event to notify the provider
      const io = req.app.get('io');
      if (io && result.booking) {
        // Fetch ProviderProfile to get user_id
        const { ProviderProfile } = require('../models');
        const profile = await ProviderProfile.findByPk(result.booking.provider_id);
        if (profile && profile.user_id) {
          const providerRoom = `user_${profile.user_id}`;
          io.to(providerRoom).emit('new_booking', { bookingId: result.booking.id, status: result.booking.status });
        }
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create Booking Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(error.statusCode || 500).json({ error: error.message || 'Failed to create booking.' });
    }
  }

  async getBookings(req, res) {
    try {
      const validatedQuery = getBookingsSchema.parse(req.query);
      const result = await bookingService.getBookings(req.user.id, req.user.role, validatedQuery);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Fetch Bookings Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const bookingId = req.params.id;
      const validatedData = updateBookingStatusSchema.parse(req.body);
      const result = await bookingService.updateBookingStatus(bookingId, validatedData.status, req.user.id, req.user.role);
      
      // Emit socket event to notify both parties
      const io = req.app.get('io');
      if (io && result.booking) {
        const clientRoom = `user_${result.booking.client_id}`;
        let providerRoom = null;
        if (result.booking.provider && result.booking.provider.user_id) {
          providerRoom = `user_${result.booking.provider.user_id}`;
        }
        
        io.to(clientRoom).emit('booking_updated', { bookingId: result.booking.id, status: result.booking.status });
        if (providerRoom) {
          io.to(providerRoom).emit('booking_updated', { bookingId: result.booking.id, status: result.booking.status });
        }
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update Booking Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(error.statusCode || 500).json({ error: error.message || 'Failed to update booking status.' });
    }
  }

  async addReview(req, res) {
    try {
      const bookingId = req.params.id;
      const validatedData = addReviewSchema.parse(req.body);
      const result = await bookingService.addReview(req.user.id, bookingId, validatedData);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Add Review Error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      }
      return res.status(error.statusCode || 500).json({ error: error.message || 'Failed to submit review.' });
    }
  }
}

module.exports = new BookingController();
