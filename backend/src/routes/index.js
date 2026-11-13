const router = require("express").Router();

const utilisateurRoutes = require("./utilisateurRoutes");
const formationRoutes = require("./formationRoutes");
const moduleRoutes = require("./moduleRoutes");
const quizRoutes = require("./quizRoutes");
const questionRoutes = require("./questionRoutes");
const reponseRoutes = require("./reponseRoutes");
const tentativeRoutes = require("./tentativeRoutes");
const evaluationRoutes = require("./evaluationRoutes");
const certificatRoutes = require("./certificatRoutes");
const reponseApprenantRoutes = require("./reponseApprenantRoutes");

router.use("/utilisateurs", utilisateurRoutes);
router.use("/formations", formationRoutes);
router.use("/modules", moduleRoutes);
router.use("/quiz", quizRoutes);
router.use("/questions", questionRoutes);
router.use("/reponses", reponseRoutes);
router.use("/tentatives", tentativeRoutes);
router.use("/evaluations", evaluationRoutes);
router.use("/certificats", certificatRoutes);
router.use("/reponses-apprenants", reponseApprenantRoutes);

module.exports = router;
