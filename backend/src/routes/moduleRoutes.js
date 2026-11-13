const router = require("express").Router();
const c = require("../controllers/ControleurModule");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/", c.listerModules);
router.get("/:id", c.obtenirModule);
router.post("/", role("administrateur"), c.creerModule);
router.put("/:id", role("administrateur"), c.modifierModule);
router.delete("/:id", role("administrateur"), c.supprimerModule);

module.exports = router;
