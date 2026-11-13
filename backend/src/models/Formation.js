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
    type: DataTypes.STRING(255),
    allowNull: true
  },
  dateDebut: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dateFin: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: "Formation",
  timestamps: false
});

module.exports = Formation;