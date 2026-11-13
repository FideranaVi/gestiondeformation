const crypto = require("crypto");
const { Certificat, Utilisateur, Formation, Quiz, Module, Evaluation } = require("../models");

exports.listerCertificats = async (req, res) => {
  try {
    const where = req.user.role === "apprenant"
      ? { idUtilisateur: req.user.idUtilisateur }
      : (req.query.idUtilisateur ? { idUtilisateur: req.query.idUtilisateur } : {});
    const certificats = await Certificat.findAll({
      where,
      include: [
        { model: Utilisateur, as: "apprenant", attributes: ["idUtilisateur", "nom", "prenom", "email"] },
        { model: Formation, as: "formation" },
        { model: Utilisateur, as: "formateur", attributes: ["idUtilisateur", "nom", "prenom"] }
      ],
      order: [["dateObtention", "DESC"]]
    });
    return res.json(certificats);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de récupération.", erreur: error.message });
  }
};

exports.obtenirCertificat = async (req, res) => {
  try {
    const certificat = await Certificat.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: "apprenant", attributes: ["idUtilisateur", "nom", "prenom", "email"] },
        { model: Formation, as: "formation" },
        { model: Utilisateur, as: "formateur", attributes: ["idUtilisateur", "nom", "prenom"] }
      ]
    });
    if (!certificat) return res.status(404).json({ message: "Certificat introuvable." });
    if (req.user.role === "apprenant" && certificat.idUtilisateur !== req.user.idUtilisateur) return res.status(403).json({ message: "Accès interdit." });
    if (req.user.role === "formateur" && certificat.idFormateur !== req.user.idUtilisateur) return res.status(403).json({ message: "Accès interdit." });
    return res.json(certificat);
  } catch (error) {
    return res.status(500).json({ message: "Erreur de lecture.", erreur: error.message });
  }
};

exports.delivrerCertificat = async (req, res) => {
  try {
    if (req.user.role !== "formateur" && req.user.role !== "administrateur") {
      return res.status(403).json({ message: "Seul un formateur ou administrateur peut délivrer un certificat." });
    }
    const { idUtilisateur, numFormation } = req.body;
    if (!idUtilisateur || !numFormation) return res.status(400).json({ message: "Apprenant et formation obligatoires." });

    const apprenant = await Utilisateur.findByPk(idUtilisateur);
    const formation = await Formation.findByPk(numFormation);
    if (!apprenant || apprenant.role !== "apprenant") return res.status(404).json({ message: "Apprenant introuvable." });
    if (!formation) return res.status(404).json({ message: "Formation introuvable." });

    const modules = await Module.findAll({ where: { numFormation }, attributes: ["codeModule"] });
    const moduleIds = modules.map((m) => m.codeModule);
    if (!moduleIds.length) return res.status(409).json({ message: "La formation ne contient aucun module." });
    const quizzes = await Quiz.findAll({
      where: { codeModule: moduleIds },
      attributes: ["codeQuiz", "idFormateur"]
    });
    const quizIds = quizzes.map((q) => q.codeQuiz);
    if (!quizIds.length) return res.status(409).json({ message: "Aucun quiz n'est associé à cette formation." });

    const evaluations = await Evaluation.findAll({
      where: { idUtilisateur, codeQuiz: quizIds, resultat: "réussi" }
    });
    if (!evaluations.length) return res.status(409).json({ message: "Aucune évaluation réussie pour cette formation." });

    const existe = await Certificat.findOne({ where: { idUtilisateur, numFormation } });
    if (existe) return res.status(409).json({ message: "Un certificat existe déjà pour cet apprenant et cette formation." });

    if (req.user.role === "formateur" && !quizzes.some((q) => q.idFormateur === req.user.idUtilisateur)) {
      return res.status(403).json({ message: "Vous ne gérez aucun quiz de cette formation." });
    }

    const numeroCertificat = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const certificat = await Certificat.create({
      numeroCertificat,
      dateObtention: new Date(),
      statutcertificat: "validée",
      idUtilisateur,
      numFormation,
      idFormateur: req.user.idUtilisateur
    });
    return res.status(201).json({ message: "Certificat délivré.", certificat });
  } catch (error) {
    return res.status(500).json({ message: "Erreur de délivrance.", erreur: error.message });
  }
};

exports.envoyerCertificat = async (req, res) => {
  try {
    if (req.user.role !== "administrateur") return res.status(403).json({ message: "Seul un administrateur peut envoyer un certificat." });
    const certificat = await Certificat.findByPk(req.params.id, {
      include: [
        { model: Utilisateur, as: "apprenant" },
        { model: Formation, as: "formation" }
      ]
    });
    if (!certificat) return res.status(404).json({ message: "Certificat introuvable." });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SMTP_FROM) {
      return res.status(503).json({ message: "Configuration e-mail manquante. Configurez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS et SMTP_FROM." });
    }

    let nodemailer;
    try {
      nodemailer = require("nodemailer");
    } catch {
      return res.status(503).json({ message: "Installez nodemailer avec : npm install nodemailer" });
    }

    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM,
      to: certificat.apprenant.email,
      subject: "Votre certificat de formation",
      text: `Bonjour ${certificat.apprenant.prenom},\n\nVotre certificat pour la formation "${certificat.formation.titre}" a été délivré.\nNuméro : ${certificat.numeroCertificat}\nDate : ${new Date(certificat.dateObtention).toLocaleDateString("fr-FR")}\nStatut : ${certificat.statutcertificat}\n\nCordialement.`
    });

    return res.json({ message: "Certificat envoyé par e-mail.", destinataire: certificat.apprenant.email });
  } catch (error) {
    return res.status(500).json({ message: "Erreur d'envoi.", erreur: error.message });
  }
};
