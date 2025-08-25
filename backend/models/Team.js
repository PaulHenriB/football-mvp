const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import Sequelize instance
const User = require('./User'); // Import User model

const Team = sequelize.define('Team', {
  teamName: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Define association (Many-to-Many) between Team and User (players)
Team.belongsToMany(User, { through: 'TeamPlayers' }); // Create a join table for players

module.exports = Team;
