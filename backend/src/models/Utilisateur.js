
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Utilisateur = sequelize.define(
  "Utilisateur",
  {
    idUtilisateur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pwd: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["administrateur", "formateur", "apprenant"]]
      }
    }
  },
  {
    tableName: "Utilisateurs",
    timestamps: false,
    freezeTableName: true
  }
);

module.exports = Utilisateur;
