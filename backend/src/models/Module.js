const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Module = sequelize.define("Module", {
  codeModule: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titreModule: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descriptionModule: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numFormation: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "Modules",
  timestamps: false
});

module.exports = Module;