const router = require("express").Router();
const c = require("../controllers/ControleurUtilisateur");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.post("/inscription", c.inscriptionApprenant);
router.post("/connexion", c.connexion);
router.get("/profil", auth, c.monProfil);
router.get("/", auth, role("administrateur"), c.listerUtilisateurs);
router.get("/:id", auth, role("administrateur"), c.obtenirUtilisateur);
router.post("/", auth, role("administrateur"), c.creerUtilisateur);
router.put("/:id", auth, role("administrateur"), c.modifierUtilisateur);
router.delete("/:id", auth, role("administrateur"), c.supprimerUtilisateur);

module.exports = router;
