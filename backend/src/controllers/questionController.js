const { Question, Quiz, Reponse, TentativeQuiz } = require("../models");

const autorise = (quiz, user) =>
  user.role === "administrateur" || (user.role === "formateur" && quiz.idFormateur === user.idUtilisateur);

exports.listerQuestions = async (req, res) => {
  try {
    const where = req.params.codeQuiz ? { codeQuiz: req.params.codeQuiz } : {};
    const questions = await Question.findAll({
      where,
      include: [{ model: Reponse, as: "reponses", attributes: req.user.role === "apprenant" ? ["numReponse", "libelle", "numQuestion"] : undefined }],
      order: [["numQuestion", "ASC"]]
    });
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.creerQuestion = async (req, res) => {
  try {
    const { typeQuestion, enonce, points, codeQuiz } = req.body;
    if (!typeQuestion || !enonce || !Number.isInteger(Number(points)) || Number(points) <= 0 || !codeQuiz) {
      return res.status(400).json({ message: "Type, énoncé, points positifs et quiz obligatoires." });
    }
    const quiz = await Quiz.findByPk(codeQuiz);
    if (!quiz) return res.status(404).json({ message: "Quiz introuvable." });
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz, statut: "terminée" } })) return res.status(409).json({ message: "Quiz déjà passé : ajout de question interdit." });
    const question = await Question.create({ typeQuestion, enonce, points: Number(points), codeQuiz });
    return res.status(201).json({ message: "Question créée.", question });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de création.", erreur: error.message });
  }
};

exports.modifierQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: "Question introuvable." });
    const quiz = await Quiz.findByPk(question.codeQuiz);
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz, statut: "terminée" } })) return res.status(409).json({ message: "Question verrouillée : tentatives terminées existantes." });
    const { typeQuestion, enonce, points } = req.body;
    if (points !== undefined && (!Number.isInteger(Number(points)) || Number(points) <= 0)) return res.status(400).json({ message: "Points invalides." });
    await question.update({
      typeQuestion: typeQuestion ?? question.typeQuestion,
      enonce: enonce ?? question.enonce,
      points: points === undefined ? question.points : Number(points)
    });
    return res.json({ message: "Question modifiée.", question });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de modification.", erreur: error.message });
  }
};

exports.supprimerQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: "Question introuvable." });
    const quiz = await Quiz.findByPk(question.codeQuiz);
    if (!autorise(quiz, req.user)) return res.status(403).json({ message: "Action non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz } })) return res.status(409).json({ message: "Suppression interdite : l'historique doit être conservé." });
    await Reponse.destroy({ where: { numQuestion: question.numQuestion } });
    await question.destroy();
    return res.json({ message: "Question et ses réponses supprimées." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de suppression.", erreur: error.message });
  }
};
