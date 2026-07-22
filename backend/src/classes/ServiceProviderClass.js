const UserClass = require('./UserClass');
const { Booking, ProviderProfile } = require('../models');

class ServiceProviderClass extends UserClass {
  constructor(userData, profileData = {}) {
    super(userData);
    this._profileId = profileData.id || null;
    this._tradeCategory = profileData.trade || '';
    this._hourlyRate = profileData.hourly_rate || 0.0;
    this._bio = profileData.bio || '';
    this._averageRating = profileData.rating || 5.0;
  }

  getProfileId() { return this._profileId; }
  getTradeCategory() { return this._tradeCategory; }
  getHourlyRate() { return this._hourlyRate; }
  getBio() { return this._bio; }
  getAverageRating() { return this._averageRating; }

  async acceptJob(bookingId) {
    const booking = await Booking.findOne({
      where: { id: bookingId, provider_id: this._profileId, status: 'PENDING' },
    });

    if (!booking) {
      throw new Error('Booking request not found or already processed');
    }

    booking.status = 'ACCEPTED';
    await booking.save();
    return booking;
  }

  async rejectJob(bookingId) {
    const booking = await Booking.findOne({
      where: { id: bookingId, provider_id: this._profileId, status: 'PENDING' },
    });

    if (!booking) {
      throw new Error('Booking request not found or already processed');
    }

    booking.status = 'REJECTED';
    await booking.save();
    return booking;
  }

  async completeJob(bookingId) {
    const booking = await Booking.findOne({
      where: { id: bookingId, provider_id: this._profileId, status: 'ACCEPTED' },
    });

    if (!booking) {
      throw new Error('Active booking not found');
    }

    booking.status = 'COMPLETED';
    await booking.save();
    return booking;
  }

  async updatePortfolio({ trade, hourlyRate, bio }) {
    let profile = await ProviderProfile.findOne({ where: { user_id: this.getId() } });
    if (!profile) {
      profile = await ProviderProfile.create({
        user_id: this.getId(),
        trade,
        hourly_rate: hourlyRate,
        bio,
      });
    } else {
      if (trade !== undefined) profile.trade = trade;
      if (hourlyRate !== undefined) profile.hourly_rate = hourlyRate;
      if (bio !== undefined) profile.bio = bio;
      await profile.save();
    }

    this._profileId = profile.id;
    this._tradeCategory = profile.trade;
    this._hourlyRate = profile.hourly_rate;
    this._bio = profile.bio;
    return profile;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      profileId: this._profileId,
      tradeCategory: this._tradeCategory,
      hourlyRate: this._hourlyRate,
      bio: this._bio,
      averageRating: this._averageRating,
    };
  }
}

module.exports = ServiceProviderClass;
