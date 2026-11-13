const router = require("express").Router();
const c = require("../controllers/ControleurEvaluation");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/", role("administrateur", "formateur", "apprenant"), c.listerEvaluations);
router.get("/:id", role("administrateur", "formateur", "apprenant"), c.obtenirEvaluation);

module.exports = router;
