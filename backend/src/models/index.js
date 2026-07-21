const { sequelize, ensureDatabaseExists } = require('../config/database');
const User = require('./User');
const ProviderProfile = require('./ProviderProfile');
const Booking = require('./Booking');

// Associations
User.hasOne(ProviderProfile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
ProviderProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Booking, { foreignKey: 'client_id', as: 'clientBookings' });
Booking.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

ProviderProfile.hasMany(Booking, { foreignKey: 'provider_id', as: 'providerBookings' });
Booking.belongsTo(ProviderProfile, { foreignKey: 'provider_id', as: 'provider' });

module.exports = {
  sequelize,
  ensureDatabaseExists,
  User,
  ProviderProfile,
  Booking,
};
