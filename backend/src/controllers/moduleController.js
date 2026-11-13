const { Module, Formation, Quiz, TentativeQuiz, Evaluation, Question, Reponse, sequelize } = require("../models");

exports.listerModules = async (req, res) => {
  try {
    const where = req.query.numFormation ? { numFormation: req.query.numFormation } : {};
    const modules = await Module.findAll({ where, order: [["numFormation", "ASC"], ["ordre", "ASC"]] });
    return res.json(modules);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.obtenirModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: "Module introuvable." });
    return res.json(module);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de lecture.", erreur: error.message });
  }
};

exports.creerModule = async (req, res) => {
  try {
    const { titreModule, descriptionModule, ordre, numFormation } = req.body;
    if (!titreModule || !Number.isInteger(Number(ordre)) || !numFormation) {
      return res.status(400).json({ message: "Titre, ordre entier et formation obligatoires." });
    }
    if (!(await Formation.findByPk(numFormation))) return res.status(404).json({ message: "Formation introuvable." });
    const doublon = await Module.findOne({ where: { numFormation, ordre } });
    if (doublon) return res.status(409).json({ message: "Cet ordre est déjà utilisé dans cette formation." });
    const module = await Module.create({ titreModule, descriptionModule: descriptionModule || null, ordre: Number(ordre), numFormation });
    return res.status(201).json({ message: "Module créé.", module });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de création.", erreur: error.message });
  }
};

exports.modifierModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id);
    if (!module) return res.status(404).json({ message: "Module introuvable." });
    const { titreModule, descriptionModule, ordre, numFormation } = req.body;
    const formationId = numFormation ?? module.numFormation;
    const ordreFinal = ordre === undefined ? module.ordre : Number(ordre);
    if (!Number.isInteger(ordreFinal)) return res.status(400).json({ message: "L'ordre doit être un entier." });
    if (!(await Formation.findByPk(formationId))) return res.status(404).json({ message: "Formation introuvable." });
    const doublon = await Module.findOne({ where: { numFormation: formationId, ordre: ordreFinal } });
    if (doublon && doublon.codeModule !== module.codeModule) return res.status(409).json({ message: "Ordre déjà utilisé." });
    await module.update({
      titreModule: titreModule ?? module.titreModule,
      descriptionModule: descriptionModule === undefined ? module.descriptionModule : descriptionModule,
      ordre: ordreFinal,
      numFormation: formationId
    });
    return res.json({ message: "Module modifié.", module });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de modification.", erreur: error.message });
  }
};

exports.supprimerModule = async (req, res) => {
  const transaction = await Module.sequelize.transaction();
  try {
    const module = await Module.findByPk(req.params.id, { transaction });
    if (!module) {
      await transaction.rollback();
      return res.status(404).json({ message: "Module introuvable." });
    }
    const quizzes = await Quiz.findAll({ where: { codeModule: module.codeModule }, attributes: ["codeQuiz"], transaction });
    const ids = quizzes.map((q) => q.codeQuiz);
    if (ids.length) {
      const [t, e] = await Promise.all([
        TentativeQuiz.count({ where: { codeQuiz: ids }, transaction }),
        Evaluation.count({ where: { codeQuiz: ids }, transaction })
      ]);
      if (t || e) {
        await transaction.rollback();
        return res.status(409).json({ message: "Suppression impossible : historique des tentatives/évaluations à conserver." });
      }
      const questions = await Question.findAll({ where: { codeQuiz: ids }, attributes: ["numQuestion"], transaction });
      const qids = questions.map((q) => q.numQuestion);
      if (qids.length) await Reponse.destroy({ where: { numQuestion: qids }, transaction });
      await Question.destroy({ where: { codeQuiz: ids }, transaction });
      await Quiz.destroy({ where: { codeQuiz: ids }, transaction });
    }
    await module.destroy({ transaction });
    await transaction.commit();
    return res.json({ message: "Module et son contenu supprimés." });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Erreur de suppression.", erreur: error.message });
  }
};
