const router = require("express").Router();
const c = require("../controllers/ControleurReponse");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/question/:numQuestion", c.listerReponses);
router.post("/", role("formateur", "administrateur"), c.creerReponse);
router.put("/:id", role("formateur", "administrateur"), c.modifierReponse);
router.delete("/:id", role("formateur", "administrateur"), c.supprimerReponse);

module.exports = router;
