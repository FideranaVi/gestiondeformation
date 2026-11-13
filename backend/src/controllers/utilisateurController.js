const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Utilisateur } = require("../models");

const ROLES = ["administrateur", "formateur", "apprenant"];

const creerToken = (user) =>
  jwt.sign(
    {
      idUtilisateur: user.idUtilisateur,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

exports.inscriptionApprenant = async (req, res) => {
  try {
    const { nom, prenom, email, pwd } = req.body;

    if (!nom || !prenom || !email || !pwd) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (String(pwd).length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }

    const existe = await Utilisateur.findOne({ where: { email } });
    if (existe) return res.status(409).json({ message: "Cette adresse e-mail est déjà utilisée." });

    const utilisateur = await Utilisateur.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.trim().toLowerCase(),
      pwd: await bcrypt.hash(pwd, 12),
      role: "apprenant"
    });

    return res.status(201).json({
      message: "Inscription réussie.",
      utilisateur: {
        idUtilisateur: utilisateur.idUtilisateur,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de l'inscription.", erreur: error.message });
  }
};

exports.connexion = async (req, res) => {
  try {
    const { email, pwd } = req.body;
    if (!email || !pwd) {
      return res.status(400).json({ message: "E-mail et mot de passe obligatoires." });
    }

    const utilisateur = await Utilisateur.findOne({
      where: { email: String(email).trim().toLowerCase() }
    });

    if (!utilisateur || !(await bcrypt.compare(pwd, utilisateur.pwd))) {
      return res.status(401).json({ message: "E-mail ou mot de passe incorrect." });
    }

    return res.json({
      message: "Connexion réussie.",
      token: creerToken(utilisateur),
      utilisateur: {
        idUtilisateur: utilisateur.idUtilisateur,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la connexion.", erreur: error.message });
  }
};

exports.monProfil = async (req, res) => {
  return res.json({ utilisateur: req.user });
};

exports.listerUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.findAll({
      attributes: ["idUtilisateur", "nom", "prenom", "email", "role"],
      order: [["idUtilisateur", "ASC"]]
    });
    return res.json(utilisateurs);
  } catch (error) {
    return res.status(500).json({ message: "Impossible de récupérer les utilisateurs.", erreur: error.message });
  }
};

exports.obtenirUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id, {
      attributes: ["idUtilisateur", "nom", "prenom", "email", "role"]
    });
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });
    return res.json(utilisateur);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de lecture.", erreur: error.message });
  }
};

exports.creerUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, pwd, role } = req.body;
    if (!nom || !prenom || !email || !pwd || !role) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (!ROLES.includes(role)) return res.status(400).json({ message: "Rôle invalide." });
    if (role === "administrateur" && req.user.role !== "administrateur") {
      return res.status(403).json({ message: "Seul un administrateur peut créer un administrateur." });
    }
    if (String(pwd).length < 8) return res.status(400).json({ message: "Mot de passe trop court (8 caractères minimum)." });

    const existe = await Utilisateur.findOne({ where: { email: String(email).trim().toLowerCase() } });
    if (existe) return res.status(409).json({ message: "E-mail déjà utilisé." });

    const utilisateur = await Utilisateur.create({
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: String(email).trim().toLowerCase(),
      pwd: await bcrypt.hash(pwd, 12),
      role
    });

    return res.status(201).json({
      message: "Utilisateur créé.",
      utilisateur: {
        idUtilisateur: utilisateur.idUtilisateur,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de création.", erreur: error.message });
  }
};

exports.modifierUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });

    const { nom, prenom, email, pwd, role } = req.body;
    if (role && !ROLES.includes(role)) return res.status(400).json({ message: "Rôle invalide." });
    if (role === "administrateur" && req.user.role !== "administrateur") {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    if (email && String(email).trim().toLowerCase() !== utilisateur.email) {
      const existe = await Utilisateur.findOne({ where: { email: String(email).trim().toLowerCase() } });
      if (existe) return res.status(409).json({ message: "E-mail déjà utilisé." });
      utilisateur.email = String(email).trim().toLowerCase();
    }
    if (nom !== undefined) utilisateur.nom = nom.trim();
    if (prenom !== undefined) utilisateur.prenom = prenom.trim();
    if (role !== undefined) utilisateur.role = role;
    if (pwd) {
      if (String(pwd).length < 8) return res.status(400).json({ message: "Mot de passe trop court." });
      utilisateur.pwd = await bcrypt.hash(pwd, 12);
    }

    await utilisateur.save();
    return res.json({ message: "Utilisateur modifié.", utilisateur: {
      idUtilisateur: utilisateur.idUtilisateur, nom: utilisateur.nom,
      prenom: utilisateur.prenom, email: utilisateur.email, role: utilisateur.role
    }});
  } catch (error) {
    return res.status(500).json({ message: "Erreur de modification.", erreur: error.message });
  }
};

exports.supprimerUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ message: "Utilisateur introuvable." });
    if (utilisateur.idUtilisateur === req.user.idUtilisateur) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }
    const { TentativeQuiz, Evaluation, Certificat, Quiz } = require("../models");
    const historique = await Promise.all([
      TentativeQuiz.count({ where: { idUtilisateur: utilisateur.idUtilisateur } }),
      Evaluation.count({ where: { idUtilisateur: utilisateur.idUtilisateur } }),
      Certificat.count({ where: { idUtilisateur: utilisateur.idUtilisateur } })
    ]);
    if (historique.some(Boolean)) {
      return res.status(409).json({ message: "Suppression impossible : cet utilisateur possède un historique à conserver." });
    }
    if (utilisateur.role === "formateur" && await Quiz.count({ where: { idFormateur: utilisateur.idUtilisateur } })) {
      return res.status(409).json({ message: "Réaffectez ou supprimez ses quiz avant de supprimer ce formateur." });
    }
    await utilisateur.destroy();
    return res.json({ message: "Utilisateur supprimé." });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de suppression.", erreur: error.message });
  }
};
