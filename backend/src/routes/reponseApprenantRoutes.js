
const express = require("express");
const router = express.Router();

const {
  enregistrerReponseApprenant,
  afficherReponsesApprenant,
  supprimerReponseApprenant
} = require("../controllers/reponseApprenantController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, enregistrerReponseApprenant);

router.get("/:idTentative", authMiddleware, afficherReponsesApprenant);

router.delete("/:idReponseApprenant", authMiddleware, supprimerReponseApprenant);

module.exports = router;
