const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Evaluation = sequelize.define("Evaluation", {
  codeEvaluation: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  dateEvaluation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  resultat: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [["réussi", "échoué"]]
    }
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
  tableName: "Evaluation",
  timestamps: false
});

module.exports = Evaluation;