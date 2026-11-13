const { Evaluation, Quiz, Module, Utilisateur } = require("../models");

exports.listerEvaluations = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "apprenant") where.idUtilisateur = req.user.idUtilisateur;
    if (req.user.role === "formateur") {
      const quizzes = await Quiz.findAll({ where: { idFormateur: req.user.idUtilisateur }, attributes: ["codeQuiz"] });
      where.codeQuiz = quizzes.map((q) => q.codeQuiz);
    }
    if (req.query.idUtilisateur && req.user.role === "administrateur") where.idUtilisateur = req.query.idUtilisateur;
    if (req.query.codeQuiz) where.codeQuiz = req.query.codeQuiz;

    const evaluations = await Evaluation.findAll({
      where,
      include: [
        { model: Quiz, as: "quiz", include: [{ model: Module, as: "module" }] },
        { model: Utilisateur, as: "apprenant", attributes: ["idUtilisateur", "nom", "prenom", "email"] }
      ],
      order: [["dateEvaluation", "DESC"]]
    });
    return res.json(evaluations);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.obtenirEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findByPk(req.params.id, {
      include: [
        { model: Quiz, as: "quiz" },
        { model: Utilisateur, as: "apprenant", attributes: ["idUtilisateur", "nom", "prenom", "email"] }
      ]
    });
    if (!evaluation) return res.status(404).json({ message: "Évaluation introuvable." });
    if (req.user.role === "apprenant" && evaluation.idUtilisateur !== req.user.idUtilisateur) {
      return res.status(403).json({ message: "Accès interdit." });
    }
    if (req.user.role === "formateur") {
      const quiz = await Quiz.findByPk(evaluation.codeQuiz);
      if (!quiz || quiz.idFormateur !== req.user.idUtilisateur) return res.status(403).json({ message: "Accès interdit." });
    }
    return res.json(evaluation);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de lecture.", erreur: error.message });
  }
};
