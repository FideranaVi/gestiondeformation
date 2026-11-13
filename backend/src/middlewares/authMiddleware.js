const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentification requise."
      });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.utilisateur = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token invalide ou expiré."
    });
  }
};