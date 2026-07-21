const UserClass = require('./UserClass');
const { Booking } = require('../models');

class ClientClass extends UserClass {
  constructor(userData, { totalBookingsMade = 0, clientRating = 5.0 } = {}) {
    super(userData);
    this._totalBookingsMade = totalBookingsMade;
    this._clientRating = clientRating;
  }

  getTotalBookingsMade() { return this._totalBookingsMade; }
  getClientRating() { return this._clientRating; }

  async requestBooking({ providerId, jobDate, description }) {
    const booking = await Booking.create({
      client_id: this.getId(),
      provider_id: providerId,
      job_date: jobDate,
      description: description,
      status: 'PENDING',
    });
    this._totalBookingsMade += 1;
    return booking;
  }

  async leaveReview(bookingId, rating, reviewText) {
    const booking = await Booking.findOne({
      where: { id: bookingId, client_id: this.getId(), status: 'COMPLETED' },
    });

    if (!booking) {
      throw new Error('Booking not found or not completed yet');
    }

    booking.rating = rating;
    booking.review_text = reviewText;
    await booking.save();
    return booking;
  }

  async cancelBooking(bookingId) {
    const booking = await Booking.findOne({
      where: { id: bookingId, client_id: this.getId(), status: 'PENDING' },
    });

    if (!booking) {
      throw new Error('Booking not found or cannot be cancelled');
    }

    booking.status = 'REJECTED';
    await booking.save();
    return booking;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      totalBookingsMade: this._totalBookingsMade,
      clientRating: this._clientRating,
    };
  }
}

module.exports = ClientClass;
