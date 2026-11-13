const router = require("express").Router();
const c = require("../controllers/certificatController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

router.use(auth);
router.get("/", role("administrateur", "formateur", "apprenant"), c.listerCertificats);
router.get("/:id", role("administrateur", "formateur", "apprenant"), c.obtenirCertificat);
router.post("/", role("administrateur", "formateur"), c.delivrerCertificat);
router.post("/:id/envoyer", role("administrateur"), c.envoyerCertificat);

module.exports = router;
