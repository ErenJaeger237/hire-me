const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('CLIENT', 'PROVIDER', 'ADMIN'),
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  profile_picture_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  location_text: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  wallet_balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  location_lat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  location_lng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
