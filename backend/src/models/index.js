
const Utilisateur = require("./Utilisateur");
const Formation = require("./Formation");
const Module = require("./Module");
const Quiz = require("./Quiz");
const Question = require("./Question");
const Reponse = require("./Reponse");
const Evaluation = require("./Evaluation");
const TentativeQuiz = require("./TentativeQuiz");
const ReponseApprenant = require("./ReponseApprenant");
const Certificat = require("./Certificat");

// Utilisateur - Formation (formateur)
Utilisateur.hasMany(Formation, {
  foreignKey: "idFormateur",
  as: "formations"
});
Formation.belongsTo(Utilisateur, {
  foreignKey: "idFormateur",
  as: "formateur"
});

// Formation - Module
Formation.hasMany(Module, {
  foreignKey: "numFormation",
  as: "modules",
  onDelete: "CASCADE"
});
Module.belongsTo(Formation, {
  foreignKey: "numFormation",
  as: "formation"
});

// Module - Quiz
Module.hasMany(Quiz, {
  foreignKey: "codeModule",
  as: "quiz",
  onDelete: "CASCADE"
});
Quiz.belongsTo(Module, {
  foreignKey: "codeModule",
  as: "module"
});

// Formateur - Quiz
Utilisateur.hasMany(Quiz, {
  foreignKey: "idFormateur",
  as: "quizCrees"
});
Quiz.belongsTo(Utilisateur, {
  foreignKey: "idFormateur",
  as: "formateur"
});

// Quiz - Question
Quiz.hasMany(Question, {
  foreignKey: "codeQuiz",
  as: "questions",
  onDelete: "CASCADE"
});
Question.belongsTo(Quiz, {
  foreignKey: "codeQuiz",
  as: "quiz"
});

// Question - Reponse
Question.hasMany(Reponse, {
  foreignKey: "numQuestion",
  as: "reponses",
  onDelete: "CASCADE"
});
Reponse.belongsTo(Question, {
  foreignKey: "numQuestion",
  as: "question"
});

// Utilisateur - Evaluation
Utilisateur.hasMany(Evaluation, {
  foreignKey: "idUtilisateur",
  as: "evaluations"
});
Evaluation.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "apprenant"
});

// Quiz - Evaluation
Quiz.hasMany(Evaluation, {
  foreignKey: "codeQuiz",
  as: "evaluations"
});
Evaluation.belongsTo(Quiz, {
  foreignKey: "codeQuiz",
  as: "quiz"
});

// Utilisateur - TentativeQuiz
Utilisateur.hasMany(TentativeQuiz, {
  foreignKey: "idUtilisateur",
  as: "tentatives"
});
TentativeQuiz.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "apprenant"
});

// Quiz - TentativeQuiz
Quiz.hasMany(TentativeQuiz, {
  foreignKey: "codeQuiz",
  as: "tentatives"
});
TentativeQuiz.belongsTo(Quiz, {
  foreignKey: "codeQuiz",
  as: "quiz"
});

// TentativeQuiz - ReponseApprenant
TentativeQuiz.hasMany(ReponseApprenant, {
  foreignKey: "idTentative",
  as: "reponses"
});
ReponseApprenant.belongsTo(TentativeQuiz, {
  foreignKey: "idTentative",
  as: "tentative"
});

// Question - ReponseApprenant
Question.hasMany(ReponseApprenant, {
  foreignKey: "numQuestion",
  as: "reponsesApprenants"
});
ReponseApprenant.belongsTo(Question, {
  foreignKey: "numQuestion",
  as: "question"
});

// Reponse - ReponseApprenant
Reponse.hasMany(ReponseApprenant, {
  foreignKey: "numReponse",
  as: "choixApprenants"
});
ReponseApprenant.belongsTo(Reponse, {
  foreignKey: "numReponse",
  as: "reponseChoisie"
});

// Utilisateur - Certificat
Utilisateur.hasMany(Certificat, {
  foreignKey: "idUtilisateur",
  as: "certificats"
});
Certificat.belongsTo(Utilisateur, {
  foreignKey: "idUtilisateur",
  as: "apprenant"
});

// Formation - Certificat
Formation.hasMany(Certificat, {
  foreignKey: "numFormation",
  as: "certificats"
});
Certificat.belongsTo(Formation, {
  foreignKey: "numFormation",
  as: "formation"
});

// Formateur - Certificat
Utilisateur.hasMany(Certificat, {
  foreignKey: "idFormateur",
  as: "certificatsDelivres"
});
Certificat.belongsTo(Utilisateur, {
  foreignKey: "idFormateur",
  as: "formateur"
});

module.exports = {
  Utilisateur,
  Formation,
  Module,
  Quiz,
  Question,
  Reponse,
  Evaluation,
  TentativeQuiz,
  ReponseApprenant,
  Certificat
};