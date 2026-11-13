
const jwt = require("jsonwebtoken");

const verifierToken = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentification requise.",
      });
    }

    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.utilisateur = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré.",
    });
  }
};

const verifierRole = (...roles) => {
  return (req, res, next) => {
    if (!req.utilisateur || !roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: "Accès refusé.",
      });
    }

    next();
  };
};

module.exports = {
  verifierToken,
  verifierRole,
};
