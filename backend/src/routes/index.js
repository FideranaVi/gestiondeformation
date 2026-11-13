const router = require("express").Router();

router.use("/utilisateurs", require("./utilisateurRoutes"));
router.use("/formations", require("./formationRoutes"));
router.use("/modules", require("./moduleRoutes"));
router.use("/quiz", require("./quizRoutes"));
router.use("/questions", require("./questionRoutes"));
router.use("/reponses", require("./reponseRoutes"));
router.use("/tentatives", require("./tentativeRoutes"));
router.use("/evaluations", require("./evaluationRoutes"));
router.use("/certificats", require("./certificatRoutes"));
router.use("/reponses-apprenants", require("./reponseApprenantRoutes"));

module.exports = router;
