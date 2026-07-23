const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SavedProvider extends Model {}

SavedProvider.init({
  client_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  provider_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'SavedProvider',
  tableName: 'saved_providers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = SavedProvider;
