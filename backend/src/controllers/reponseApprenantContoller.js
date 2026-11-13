const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReponseApprenant = sequelize.define(
  "ReponseApprenant",
  {
    idReponseApprenant: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idTentative: { type: DataTypes.INTEGER, allowNull: false },
    numQuestion: { type: DataTypes.INTEGER, allowNull: false },
    numReponse: { type: DataTypes.INTEGER, allowNull: true },
    texteReponse: { type: DataTypes.TEXT, allowNull: true },
    estCorrecte: { type: DataTypes.BOOLEAN, allowNull: true },
    pointsObtenus: { type: DataTypes.FLOAT, defaultValue: 0 }
  },
  {
    tableName: "reponse_apprenant",
    timestamps: false
  }
);

module.exports = ReponseApprenant;