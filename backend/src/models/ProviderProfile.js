const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProviderProfile = sequelize.define('ProviderProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  trade: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  hourly_rate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.0,
  },
}, {
  tableName: 'provider_profiles',
  timestamps: true,
});

module.exports = ProviderProfile;
