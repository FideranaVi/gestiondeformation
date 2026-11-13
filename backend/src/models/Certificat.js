const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Certificat = sequelize.define("Certificat", {
  idCertificat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numeroCertificat: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  dateObtention: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  statutcertificat: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "validée"
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  numFormation: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idFormateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "Certification",
  timestamps: false
});

module.exports = Certificat;