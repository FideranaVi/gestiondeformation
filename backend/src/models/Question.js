const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Question = sequelize.define("Question", {
  numQuestion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  typeQuestion: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  enonce: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  codeQuiz: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "Questions",
  timestamps: false
});

module.exports = Question;