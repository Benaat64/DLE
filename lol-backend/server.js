const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const lolRoutes = require("./routes/lolRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", lolRoutes);

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error("Erreur globale:", err.stack);
  res.status(500).json({ error: "Une erreur s'est produite sur le serveur" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
