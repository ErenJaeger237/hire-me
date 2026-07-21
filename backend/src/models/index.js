const { sequelize, ensureDatabaseExists } = require('../config/database');
const User = require('./User');
const ProviderProfile = require('./ProviderProfile');
const Booking = require('./Booking');
const Message = require('./Message');

// Associations
User.hasOne(ProviderProfile, { foreignKey: 'user_id', as: 'profile', onDelete: 'CASCADE' });
ProviderProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Booking, { foreignKey: 'client_id', as: 'clientBookings' });
Booking.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

ProviderProfile.hasMany(Booking, { foreignKey: 'provider_id', as: 'providerBookings' });
Booking.belongsTo(ProviderProfile, { foreignKey: 'provider_id', as: 'provider' });

Booking.hasMany(Message, { foreignKey: 'booking_id', as: 'messages' });
Message.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

module.exports = {
  sequelize,
  ensureDatabaseExists,
  User,
  ProviderProfile,
  Booking,
  Message,
};
