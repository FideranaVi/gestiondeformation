const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TentativeQuiz = sequelize.define("TentativeQuiz", {
  idTentative: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dateTentative: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "en cours"
  },
  idUtilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  codeQuiz: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "TentativeQuiz",
  timestamps: false
});

module.exports = TentativeQuiz;