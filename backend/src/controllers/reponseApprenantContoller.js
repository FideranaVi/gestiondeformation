
const {
  ReponseApprenant,
  TentativeQuiz,
  Question,
  Reponse
} = require("../models");

exports.enregistrerReponseApprenant = async (req, res) => {
  try {
    const { idTentative, numQuestion, numReponse, texteReponse } = req.body;
    const idUtilisateur = req.user.idUtilisateur;

    if (!idTentative || !numQuestion) {
      return res.status(400).json({
        message: "La tentative et la question sont obligatoires."
      });
    }

    const tentative = await TentativeQuiz.findByPk(idTentative);

    if (!tentative) {
      return res.status(404).json({
        message: "Tentative introuvable."
      });
    }

    if (tentative.idUtilisateur !== idUtilisateur) {
      return res.status(403).json({
        message: "Vous ne pouvez pas modifier cette tentative."
      });
    }

    if (tentative.statut !== "en cours") {
      return res.status(400).json({
        message: "Cette tentative est déjà terminée."
      });
    }

    const question = await Question.findByPk(numQuestion);

    if (!question || question.codeQuiz !== tentative.codeQuiz) {
      return res.status(404).json({
        message: "Question introuvable dans ce quiz."
      });
    }

    let reponseChoisie = null;
    let estCorrecte = null;
    let pointsObtenus = 0;

    if (question.typeQuestion === "quiz") {
      if (!numReponse) {
        return res.status(400).json({
          message: "Veuillez choisir une réponse."
        });
      }

      reponseChoisie = await Reponse.findOne({
        where: {
          numReponse,
          numQuestion
        }
      });

      if (!reponseChoisie) {
        return res.status(404).json({
          message: "Réponse introuvable pour cette question."
        });
      }

      estCorrecte = reponseChoisie.estCorrecte;

      if (estCorrecte) {
        pointsObtenus = question.points;
      }
    } else if (question.typeQuestion === "enonce") {
      if (!texteReponse || !texteReponse.trim()) {
        return res.status(400).json({
          message: "Veuillez saisir votre réponse."
        });
      }
    } else {
      return res.status(400).json({
        message: "Type de question non reconnu."
      });
    }

    const reponseExistante = await ReponseApprenant.findOne({
      where: {
        idTentative,
        numQuestion
      }
    });

    let resultat;

    if (reponseExistante) {
      resultat = await reponseExistante.update({
        numReponse: reponseChoisie ? reponseChoisie.numReponse : null,
        texteReponse: question.typeQuestion === "enonce"
          ? texteReponse.trim()
          : null,
        estCorrecte,
        pointsObtenus
      });
    } else {
      resultat = await ReponseApprenant.create({
        idTentative,
        numQuestion,
        numReponse: reponseChoisie ? reponseChoisie.numReponse : null,
        texteReponse: question.typeQuestion === "enonce"
          ? texteReponse.trim()
          : null,
        estCorrecte,
        pointsObtenus
      });
    }

    return res.status(201).json({
      message: "Réponse enregistrée avec succès.",
      reponse: resultat
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de la réponse.",
      erreur: error.message
    });
  }
};


exports.afficherReponsesApprenant = async (req, res) => {
  try {
    const { idTentative } = req.params;
    const idUtilisateur = req.user.idUtilisateur;

    const tentative = await TentativeQuiz.findByPk(idTentative);

    if (!tentative) {
      return res.status(404).json({
        message: "Tentative introuvable."
      });
    }

    if (
      tentative.idUtilisateur !== idUtilisateur &&
      req.user.role !== "administrateur"
    ) {
      return res.status(403).json({
        message: "Accès refusé à ces réponses."
      });
    }

    const reponses = await ReponseApprenant.findAll({
      where: { idTentative },
      order: [["numQuestion", "ASC"]]
    });

    return res.status(200).json({
      message: "Liste des réponses récupérée.",
      reponses
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la récupération des réponses.",
      erreur: error.message
    });
  }
};


exports.supprimerReponseApprenant = async (req, res) => {
  try {
    const { idReponseApprenant } = req.params;
    const idUtilisateur = req.user.idUtilisateur;

    const reponse = await ReponseApprenant.findByPk(idReponseApprenant);

    if (!reponse) {
      return res.status(404).json({
        message: "Réponse introuvable."
      });
    }

    const tentative = await TentativeQuiz.findByPk(reponse.idTentative);

    if (!tentative) {
      return res.status(404).json({
        message: "Tentative introuvable."
      });
    }

    if (
      tentative.idUtilisateur !== idUtilisateur &&
      req.user.role !== "administrateur"
    ) {
      return res.status(403).json({
        message: "Vous ne pouvez pas supprimer cette réponse."
      });
    }

    if (tentative.statut !== "en cours") {
      return res.status(400).json({
        message: "Impossible de supprimer une réponse d'une tentative terminée."
      });
    }

    await reponse.destroy();

    return res.status(200).json({
      message: "Réponse supprimée avec succès."
    });

  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la suppression de la réponse.",
      erreur: error.message
    });
  }
};
