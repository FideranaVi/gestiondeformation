const jwt = require("jsonwebtoken");
const { Utilisateur } = require("../models");

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentification requise." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const utilisateur = await Utilisateur.findByPk(decoded.idUtilisateur, {
      attributes: ["idUtilisateur", "nom", "prenom", "email", "role"]
    });

    if (!utilisateur) {
      return res.status(401).json({ message: "Utilisateur introuvable." });
    }

    req.user = utilisateur;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
