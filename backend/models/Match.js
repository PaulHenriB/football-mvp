const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Team = require('./Team');

const Match = sequelize.define('Match', {
  matchType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  results: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
});

// Associations
Match.belongsTo(User, { foreignKey: 'scheduledBy' });
Match.belongsToMany(Team, { through: 'MatchTeams' });

module.exports = Match;
