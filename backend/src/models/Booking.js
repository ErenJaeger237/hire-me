const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'DISPUTED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  job_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimated_hours: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
  },
  review_text: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'bookings',
  timestamps: true,
});

module.exports = Booking;
