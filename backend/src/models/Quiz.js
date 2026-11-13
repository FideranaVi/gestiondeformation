const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Quiz = sequelize.define("Quiz", {
  codeQuiz: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nomQuiz: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descriptionQuiz: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  seuilReussite: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 70
  },
  codeModule: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idFormateur: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "Quiz",
  timestamps: false
});

module.exports = Quiz;