const { Formation, Module } = require("../models");

exports.listerFormations = async (req, res) => {
  try {
    const formations = await Formation.findAll({
      include: [{ model: Module, as: "modules" }],
      order: [["numFormation", "DESC"]]
    });

    return res.json(formations);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de récupération des formations.",
      erreur: error.message
    });
  }
};

exports.obtenirFormation = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id, {
      include: [{ model: Module, as: "modules" }]
    });

    if (!formation) {
      return res.status(404).json({ message: "Formation introuvable." });
    }

    return res.json(formation);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de lecture.",
      erreur: error.message
    });
  }
};

exports.creerFormation = async (req, res) => {
  try {
    const { titre, description } = req.body;

    if (!titre || typeof titre !== "string" || !titre.trim()) {
      return res.status(400).json({
        message: "Le titre de la formation est obligatoire."
      });
    }

    const formation = await Formation.create({
      titre: titre.trim(),
      description: description || null,
      idFormateur: req.user?.code_utilisateur || null
    });

    return res.status(201).json({
      message: "Formation créée avec succès.",
      formation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de création.",
      erreur: error.message
    });
  }
};

exports.modifierFormation = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);

    if (!formation) {
      return res.status(404).json({ message: "Formation introuvable." });
    }

    const { titre, description } = req.body;

    if (titre !== undefined && (typeof titre !== "string" || !titre.trim())) {
      return res.status(400).json({ message: "Le titre est invalide." });
    }

    await formation.update({
      titre: titre === undefined ? formation.titre : titre.trim(),
      description: description === undefined ? formation.description : description
    });

    return res.json({
      message: "Formation modifiée avec succès.",
      formation
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de modification.",
      erreur: error.message
    });
  }
};

exports.supprimerFormation = async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);

    if (!formation) {
      return res.status(404).json({ message: "Formation introuvable." });
    }

    const nombreModules = await Module.count({
      where: { numFormation: formation.numFormation }
    });

    if (nombreModules > 0) {
      return res.status(409).json({
        message: "Impossible de supprimer cette formation : elle contient encore des modules."
      });
    }

    await formation.destroy();

    return res.json({
      message: "Formation supprimée avec succès."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur de suppression.",
      erreur: error.message
    });
  }
};
