const { Reponse, Question, Quiz, TentativeQuiz } = require("../models");

const autorise = (quiz, user) =>
  user.role === "administrateur" || (user.role === "formateur" && quiz.idFormateur === user.idUtilisateur);

exports.listerReponses = async (req, res) => {
  try {
    const reponses = await Reponse.findAll({
      where: req.params.numQuestion ? { numQuestion: req.params.numQuestion } : {},
      attributes: req.user.role === "apprenant" ? ["numReponse", "libelle", "numQuestion"] : undefined,
      order: [["numReponse", "ASC"]]
    });
    return res.json(reponses);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.creerReponse = async (req, res) => {
  try {
    const { libelle, estCorrecte, numQuestion } = req.body;
    if (!libelle || !numQuestion || typeof estCorrecte !== "boolean") {
      return res.status(400).json({ message: "Libellé, question et indicateur estCorrecte (true/false) obligatoires." });
    }
    const question = await Question.findByPk(numQuestion);
    if (!question) return res.status(404).json({ message: "Question introuvable." });
    const quiz = await Quiz.findByPk(question.codeQuiz);
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz, statut: "terminée" } })) return res.status(409).json({ message: "Réponses verrouillées : tentatives terminées existantes." });
    const reponse = await Reponse.create({ libelle, estCorrecte, numQuestion });
    return res.status(201).json({ message: "Réponse créée.", reponse });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de création.", erreur: error.message });
  }
};

exports.modifierReponse = async (req, res) => {
  try {
    const reponse = await Reponse.findByPk(req.params.id);
    if (!reponse) return res.status(404).json({ message: "Réponse introuvable." });
    const question = await Question.findByPk(reponse.numQuestion);
    const quiz = await Quiz.findByPk(question.codeQuiz);
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz, statut: "terminée" } })) return res.status(409).json({ message: "Réponse verrouillée : tentatives terminées existantes." });
    const { libelle, estCorrecte } = req.body;
    if (estCorrecte !== undefined && typeof estCorrecte !== "boolean") return res.status(400).json({ message: "estCorrecte doit être un booléen." });
    if (estCorrecte === false && reponse.estCorrecte) {
      const nbCorrectes = await Reponse.count({ where: { numQuestion: question.numQuestion, estCorrecte: true } });
      if (nbCorrectes <= 1) return res.status(409).json({ message: "Chaque question doit garder au moins une réponse correcte." });
    }
    await reponse.update({ libelle: libelle ?? reponse.libelle, estCorrecte: estCorrecte ?? reponse.estCorrecte });
    return res.json({ message: "Réponse modifiée.", reponse });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de modification.", erreur: error.message });
  }
};

exports.supprimerReponse = async (req, res) => {
  try {
    const reponse = await Reponse.findByPk(req.params.id);
    if (!reponse) return res.status(404).json({ message: "Réponse introuvable." });
    const question = await Question.findByPk(reponse.numQuestion);
    const quiz = await Quiz.findByPk(question.codeQuiz);
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz } })) return res.status(409).json({ message: "Suppression interdite : historique à conserver." });
    if (reponse.estCorrecte && await Reponse.count({ where: { numQuestion: question.numQuestion, estCorrecte: true } }) <= 1) {
      return res.status(409).json({ message: "Impossible de supprimer la dernière réponse correcte." });
    }
    const total = await Reponse.count({ where: { numQuestion: question.numQuestion } });
    if (total <= 2) return res.status(409).json({ message: "Une question doit avoir au moins deux réponses." });
    await reponse.destroy();
    return res.json({ message: "Réponse supprimée." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de suppression.", erreur: error.message });
  }
};
