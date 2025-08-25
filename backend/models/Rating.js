const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User'); // Import User model

const Rating = sequelize.define('Rating', {
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// Define association
Rating.belongsTo(User, { foreignKey: 'userId' });

module.exports = Rating;
