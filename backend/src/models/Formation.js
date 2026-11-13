const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Formation = sequelize.define("Formation", {
  numFormation: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateCreation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  idFormateur: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "Formation",
  timestamps: false
});

module.exports = Formation;
