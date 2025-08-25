const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import Sequelize instance
const User = require('./User'); // Import User model

const Group = sequelize.define('Group', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  inviteCode: {
    type: DataTypes.STRING,
    unique: true
  }
});

// Define associations
Group.belongsTo(User, { foreignKey: 'createdBy' }); // Group creator
Group.belongsToMany(User, { through: 'GroupMembers' }); // Members in the group

module.exports = Group;
