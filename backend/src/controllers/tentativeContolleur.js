const { TentativeQuiz, ReponseApprenant, Quiz, Question, Reponse, Evaluation } = require("../models");
const { verifierQuizAvantTentative } = require("./ControleurQuiz");

const estApprenant = (req) => req.user.role === "apprenant";

exports.demarrerTentative = async (req, res) => {
  try {
    if (!estApprenant(req)) return res.status(403).json({ message: "Seul un apprenant peut passer un quiz." });
    const codeQuiz = req.body.codeQuiz || req.params.codeQuiz;
    const quiz = await verifierQuizAvantTentative(codeQuiz);
    const tentative = await TentativeQuiz.create({
      dateTentative: new Date(),
      statut: "en cours",
      idUtilisateur: req.user.idUtilisateur,
      codeQuiz: quiz.codeQuiz
    });
    return res.status(201).json({
      message: "Tentative démarrée.",
      tentative,
      dureeMinutes: quiz.duree,
      questions: quiz.questions.map((q) => ({
        numQuestion: q.numQuestion,
        typeQuestion: q.typeQuestion,
        enonce: q.enonce,
        points: q.points,
        reponses: q.reponses.map((r) => ({ numReponse: r.numReponse, libelle: r.libelle }))
      }))
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.enregistrerReponses = async (req, res) => {
  try {
    const tentative = await TentativeQuiz.findByPk(req.params.idTentative);
    if (!tentative) return res.status(404).json({ message: "Tentative introuvable." });
    if (tentative.idUtilisateur !== req.user.idUtilisateur) return res.status(403).json({ message: "Cette tentative ne vous appartient pas." });
    if (tentative.statut !== "en cours") return res.status(409).json({ message: "Cette tentative est déjà terminée." });

    const quiz = await Quiz.findByPk(tentative.codeQuiz);
    const tempsEcoule = (Date.now() - new Date(tentative.dateTentative).getTime()) / 60000;
    if (tempsEcoule > quiz.duree) return res.status(409).json({ message: "La durée du quiz est dépassée." });

    const reponses = req.body.reponses;
    if (!Array.isArray(reponses) || !reponses.length) {
      return res.status(400).json({ message: "Envoyez une liste de réponses." });
    }

    for (const item of reponses) {
      const question = await Question.findOne({ where: { numQuestion: item.numQuestion, codeQuiz: tentative.codeQuiz } });
      if (!question) return res.status(400).json({ message: `Question invalide : ${item.numQuestion}` });
      const ids = Array.isArray(item.numReponses) ? item.numReponses : (item.numReponse ? [item.numReponse] : []);
      if (ids.length) {
        const valides = await Reponse.count({ where: { numReponse: ids, numQuestion: question.numQuestion } });
        if (valides !== ids.length) return res.status(400).json({ message: "Une ou plusieurs réponses ne correspondent pas à la question." });
      }
    }

    await ReponseApprenant.destroy({ where: { idTentative: tentative.idTentative } });
    const rows = [];
    for (const item of reponses) {
      const ids = Array.isArray(item.numReponses) ? item.numReponses : (item.numReponse ? [item.numReponse] : []);
      if (ids.length) {
        for (const numReponse of ids) rows.push({
          idTentative: tentative.idTentative,
          numQuestion: item.numQuestion,
          numReponse,
          texteReponse: item.texteReponse || null
        });
      } else {
        rows.push({
          idTentative: tentative.idTentative,
          numQuestion: item.numQuestion,
          numReponse: null,
          texteReponse: item.texteReponse || null
        });
      }
    }
    await ReponseApprenant.bulkCreate(rows);
    return res.json({ message: "Réponses enregistrées.", nombre: rows.length });
  } catch (error) {
    return res.status(500).json({ message: "Erreur d'enregistrement.", erreur: error.message });
  }
};

exports.terminerTentative = async (req, res) => {
  const transaction = await TentativeQuiz.sequelize.transaction();
  try {
    const tentative = await TentativeQuiz.findByPk(req.params.idTentative, { transaction });
    if (!tentative) {
      await transaction.rollback();
      return res.status(404).json({ message: "Tentative introuvable." });
    }
    if (tentative.idUtilisateur !== req.user.idUtilisateur && req.user.role !== "administrateur") {
      await transaction.rollback();
      return res.status(403).json({ message: "Action non autorisée." });
    }
    if (tentative.statut !== "en cours") {
      await transaction.rollback();
      return res.status(409).json({ message: "Tentative déjà terminée." });
    }

    const quiz = await Quiz.findByPk(tentative.codeQuiz, {
      include: [{ model: Question, as: "questions", include: [{ model: Reponse, as: "reponses" }] }],
      transaction
    });
    const donnees = await ReponseApprenant.findAll({ where: { idTentative: tentative.idTentative }, transaction });
    let totalPoints = 0;
    let pointsObtenus = 0;
    const maj = [];

    for (const question of quiz.questions) {
      totalPoints += Number(question.points);
      const correctes = question.reponses.filter((r) => r.estCorrecte).map((r) => r.numReponse).sort((a, b) => a - b);
      const choisies = donnees.filter((r) => r.numQuestion === question.numQuestion && r.numReponse !== null).map((r) => r.numReponse).sort((a, b) => a - b);
      const juste = correctes.length === choisies.length && correctes.every((id, i) => id === choisies[i]);
      const points = juste ? Number(question.points) : 0;
      pointsObtenus += points;
      donnees.filter((r) => r.numQuestion === question.numQuestion).forEach((r) => {
        maj.push(r.update({ estCorrecte: juste, pointsObtenus: donnees.filter((x) => x.numQuestion === question.numQuestion).length ? points / donnees.filter((x) => x.numQuestion === question.numQuestion).length : 0 }, { transaction }));
      });
    }

    await Promise.all(maj);
    const score = totalPoints > 0 ? Number(((pointsObtenus / totalPoints) * 100).toFixed(2)) : 0;
    const resultat = score >= Number(quiz.seuilReussite) ? "réussi" : "échoué";
    await tentative.update({ score, statut: "terminée" }, { transaction });
    const evaluation = await Evaluation.create({
      score,
      dateEvaluation: new Date(),
      resultat,
      idUtilisateur: tentative.idUtilisateur,
      codeQuiz: tentative.codeQuiz
    }, { transaction });

    await transaction.commit();
    return res.json({ message: "Quiz terminé.", score, totalPoints, pointsObtenus, resultat, evaluation });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Erreur lors de la correction.", erreur: error.message });
  }
};

exports.mesTentatives = async (req, res) => {
  try {
    const where = req.user.role === "administrateur" && req.query.idUtilisateur
      ? { idUtilisateur: req.query.idUtilisateur }
      : { idUtilisateur: req.user.idUtilisateur };
    const tentatives = await TentativeQuiz.findAll({
      where,
      include: [{ model: ReponseApprenant, as: "reponses" }],
      order: [["dateTentative", "DESC"]]
    });
    return res.json(tentatives);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};
