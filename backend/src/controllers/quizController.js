const { Quiz, Module, Question, Reponse, TentativeQuiz, Evaluation } = require("../models");

const verifierProprietaire = (quiz, user) =>
  user.role === "administrateur" || (user.role === "formateur" && quiz.idFormateur === user.idUtilisateur);

exports.listerQuiz = async (req, res) => {
  try {
    const where = {};
    if (req.query.codeModule) where.codeModule = req.query.codeModule;
    if (req.user.role === "formateur") where.idFormateur = req.user.idUtilisateur;
    const quiz = await Quiz.findAll({
      where,
      include: [{ model: Module, as: "module" }],
      order: [["codeQuiz", "DESC"]]
    });
    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.obtenirQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [
        { model: Module, as: "module" },
        { model: Question, as: "questions", include: [{ model: Reponse, as: "reponses" }] }
      ]
    });
    if (!quiz) return res.status(404).json({ message: "Quiz introuvable." });
    if (req.user.role === "formateur" && !verifierProprietaire(quiz, req.user)) return res.status(403).json({ message: "Ce quiz ne vous appartient pas." });
    if (req.user.role === "apprenant") {
      const safe = quiz.toJSON();
      safe.questions = (safe.questions || []).map(({ reponses, ...q }) => ({
        ...q,
        reponses: (reponses || []).map(({ estCorrecte, ...r }) => r)
      }));
      return res.json(safe);
    }
    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de lecture.", erreur: error.message });
  }
};

exports.creerQuiz = async (req, res) => {
  try {
    const { nomQuiz, descriptionQuiz, duree, seuilReussite, codeModule } = req.body;
    if (!nomQuiz || !Number.isInteger(Number(duree)) || Number(duree) <= 0 || !codeModule) {
      return res.status(400).json({ message: "Nom, durée positive et module obligatoires." });
    }
    if (seuilReussite !== undefined && (Number(seuilReussite) < 0 || Number(seuilReussite) > 100)) {
      return res.status(400).json({ message: "Le seuil doit être compris entre 0 et 100." });
    }
    if (!(await Module.findByPk(codeModule))) return res.status(404).json({ message: "Module introuvable." });
    const quiz = await Quiz.create({
      nomQuiz, descriptionQuiz: descriptionQuiz || null, duree: Number(duree),
      seuilReussite: seuilReussite === undefined ? 70 : Number(seuilReussite),
      codeModule, idFormateur: req.user.idUtilisateur
    });
    return res.status(201).json({ message: "Quiz créé.", quiz });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de création.", erreur: error.message });
  }
};

exports.modifierQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz introuvable." });
    if (!verifierProprietaire(quiz, req.user)) return res.status(403).json({ message: "Modification non autorisée." });
    if (await TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz, statut: "terminée" } })) {
      return res.status(409).json({ message: "Ce quiz possède déjà des tentatives terminées : sa structure doit être conservée." });
    }
    const { nomQuiz, descriptionQuiz, duree, seuilReussite, codeModule } = req.body;
    if (duree !== undefined && (!Number.isInteger(Number(duree)) || Number(duree) <= 0)) return res.status(400).json({ message: "Durée invalide." });
    if (seuilReussite !== undefined && (Number(seuilReussite) < 0 || Number(seuilReussite) > 100)) return res.status(400).json({ message: "Seuil invalide." });
    if (codeModule && !(await Module.findByPk(codeModule))) return res.status(404).json({ message: "Module introuvable." });
    await quiz.update({
      nomQuiz: nomQuiz ?? quiz.nomQuiz,
      descriptionQuiz: descriptionQuiz === undefined ? quiz.descriptionQuiz : descriptionQuiz,
      duree: duree === undefined ? quiz.duree : Number(duree),
      seuilReussite: seuilReussite === undefined ? quiz.seuilReussite : Number(seuilReussite),
      codeModule: codeModule ?? quiz.codeModule
    });
    return res.json({ message: "Quiz modifié.", quiz });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de modification.", erreur: error.message });
  }
};

exports.supprimerQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz introuvable." });
    if (!verifierProprietaire(quiz, req.user)) return res.status(403).json({ message: "Suppression non autorisée." });
    const [tentatives, evaluations] = await Promise.all([
      TentativeQuiz.count({ where: { codeQuiz: quiz.codeQuiz } }),
      Evaluation.count({ where: { codeQuiz: quiz.codeQuiz } })
    ]);
    if (tentatives || evaluations) return res.status(409).json({ message: "Suppression impossible : l'historique doit être conservé." });
    const questions = await Question.findAll({ where: { codeQuiz: quiz.codeQuiz }, attributes: ["numQuestion"] });
    const ids = questions.map((q) => q.numQuestion);
    if (ids.length) await Reponse.destroy({ where: { numQuestion: ids } });
    await Question.destroy({ where: { codeQuiz: quiz.codeQuiz } });
    await quiz.destroy();
    return res.json({ message: "Quiz supprimé." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de suppression.", erreur: error.message });
  }
};

exports.verifierQuizAvantTentative = async (codeQuiz) => {
  const quiz = await Quiz.findByPk(codeQuiz, {
    include: [{ model: Question, as: "questions", include: [{ model: Reponse, as: "reponses" }] }]
  });
  if (!quiz) throw new Error("Quiz introuvable.");
  if (!quiz.questions || quiz.questions.length === 0) throw new Error("Le quiz doit contenir au moins une question.");
  for (const question of quiz.questions) {
    if (!question.reponses || question.reponses.length < 2) throw new Error(`La question ${question.numQuestion} doit avoir au moins deux réponses.`);
    if (!question.reponses.some((r) => r.estCorrecte)) throw new Error(`La question ${question.numQuestion} doit avoir au moins une réponse correcte.`);
  }
  return quiz;
};
