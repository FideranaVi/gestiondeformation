const router = require("express").Router();
const c = require("../controllers/questionController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/quiz/:codeQuiz", c.listerQuestions);
router.post("/", role("formateur", "administrateur"), c.creerQuestion);
router.put("/:id", role("formateur", "administrateur"), c.modifierQuestion);
router.delete("/:id", role("formateur", "administrateur"), c.supprimerQuestion);

module.exports = router;
