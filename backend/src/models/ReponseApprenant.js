
const {
  ReponseApprenant,
  TentativeQuiz,
  Question,
  Reponse
} = require("../models");

const obtenirTentativeApprenant = async (idTentative, idUtilisateur) => {
  return await TentativeQuiz.findOne({
    where: {
      idTentative,
      idUtilisateur
    }
  });
};

// ENREGISTRER OU MODIFIER UNE RÉPONSE
const enregistrerReponseApprenant = async (req, res) => {
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const { idTentative, numQuestion, numReponse, texteReponse } = req.body;

    if (!idTentative || !numQuestion) {
      return res.status(400).json({
        message: "La tentative et la question sont obligatoires."
      });
    }

    if (!numReponse && !texteReponse?.trim()) {
      return res.status(400).json({
        message: "Veuillez fournir une réponse."
      });
    }

    const tentative = await obtenirTentativeApprenant(
      idTentative,
      idUtilisateur
    );

    if (!tentative) {
      return res.status(404).json({
        message: "Tentative introuvable ou non autorisée."
      });
    }

    if (tentative.statut !== "en cours") {
      return res.status(400).json({
        message: "Cette tentative est déjà terminée."
      });
    }

    const question = await Question.findOne({
      where: {
        numQuestion,
        codeQuiz: tentative.codeQuiz
      }
    });

    if (!question) {
      return res.status(404).json({
        message: "Question introuvable dans ce quiz."
      });
    }

    let estCorrecte = null;
    let pointsObtenus = 0;

    if (numReponse) {
      const reponse = await Reponse.findOne({
        where: {
          numReponse,
          numQuestion
        }
      });

      if (!reponse) {
        return res.status(404).json({
          message: "Réponse sélectionnée introuvable pour cette question."
        });
      }

      estCorrecte = reponse.estCorrecte;
      pointsObtenus = reponse.estCorrecte ? question.points : 0;
    }

    const donnees = {
      idTentative,
      numQuestion,
      numReponse: numReponse || null,
      texteReponse: texteReponse?.trim() || null,
      estCorrecte,
      pointsObtenus
    };

    const reponseExistante = await ReponseApprenant.findOne({
      where: {
        idTentative,
        numQuestion
      }
    });

    let resultat;

    if (reponseExistante) {
      await reponseExistante.update(donnees);
      resultat = reponseExistante;
    } else {
      resultat = await ReponseApprenant.create(donnees);
    }

    return res.status(200).json({
      message: "Réponse enregistrée avec succès.",
      reponse: resultat
    });

  } catch (error) {
    console.error("Erreur enregistrement réponse :", error);

    return res.status(500).json({
      message: "Erreur lors de l'enregistrement de la réponse.",
      erreur: error.message
    });
  }
};

// AFFICHER LES RÉPONSES D'UNE TENTATIVE
const afficherReponsesApprenant = async (req, res) => {
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const { idTentative } = req.params;

    const tentative = await obtenirTentativeApprenant(
      idTentative,
      idUtilisateur
    );

    if (!tentative) {
      return res.status(404).json({
        message: "Tentative introuvable ou non autorisée."
      });
    }

    const reponses = await ReponseApprenant.findAll({
      where: { idTentative },
      include: [
        {
          model: Question,
          as: "question"
        },
        {
          model: Reponse,
          as: "reponseChoisie",
          required: false
        }
      ]
    });

    return res.status(200).json({
      message: "Liste des réponses récupérée.",
      reponses
    });

  } catch (error) {
    console.error("Erreur affichage réponses :", error);

    return res.status(500).json({
      message: "Erreur lors de la récupération des réponses.",
      erreur: error.message
    });
  }
};

// SUPPRIMER UNE RÉPONSE
const supprimerReponseApprenant = async (req, res) => {
  try {
    const idUtilisateur = req.user.idUtilisateur;
    const { idReponseApprenant } = req.params;

    const reponse = await ReponseApprenant.findByPk(
      idReponseApprenant
    );

    if (!reponse) {
      return res.status(404).json({
        message: "Réponse introuvable."
      });
    }

    const tentative = await obtenirTentativeApprenant(
      reponse.idTentative,
      idUtilisateur
    );

    if (!tentative) {
      return res.status(403).json({
        message: "Vous n'êtes pas autorisé à supprimer cette réponse."
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
    console.error("Erreur suppression réponse :", error);

    return res.status(500).json({
      message: "Erreur lors de la suppression de la réponse.",
      erreur: error.message
    });
  }
};

module.exports = {
  enregistrerReponseApprenant,
  afficherReponsesApprenant,
  supprimerReponseApprenant
};
