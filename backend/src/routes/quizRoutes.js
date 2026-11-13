const router = require("express").Router();
const c = require("../controllers/quizController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/", c.listerQuiz);
router.get("/:id", c.obtenirQuiz);
router.post("/", role("formateur", "administrateur"), c.creerQuiz);
router.put("/:id", role("formateur", "administrateur"), c.modifierQuiz);
router.delete("/:id", role("formateur", "administrateur"), c.supprimerQuiz);

module.exports = router;
