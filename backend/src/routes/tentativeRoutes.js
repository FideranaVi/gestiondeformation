const router = require("express").Router();
const c = require("../controllers/tentativeContolleur");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/mes-tentatives", c.mesTentatives);
router.post("/demarrer", role("apprenant"), c.demarrerTentative);
router.post("/:idTentative/reponses", role("apprenant"), c.enregistrerReponses);
router.post("/:idTentative/terminer", role("apprenant", "administrateur"), c.terminerTentative);

module.exports = router;
