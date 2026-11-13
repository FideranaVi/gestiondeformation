
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API Gestion de Formation opérationnelle." });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Route introuvable." });
});

const PORT = process.env.PORT || 4000;

const demarrerServeur = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connexion PostgreSQL Render réussie !");

    app.listen(PORT, () => {
      console.log(`Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erreur de démarrage :", error.message);
    process.exit(1);
  }
};

demarrerServeur();
