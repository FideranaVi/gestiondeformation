const router = require("express").Router();
const c = require("../controllers/formationController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/", c.listerFormations);
router.get("/:id", c.obtenirFormation);
router.post("/", role("administrateur"), c.creerFormation);
router.put("/:id", role("administrateur"), c.modifierFormation);
router.delete("/:id", role("administrateur"), c.supprimerFormation);

module.exports = router;
