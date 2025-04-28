const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const lolRoutes = require("./routes/lolRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api", lolRoutes);

// Servir les fichiers statiques du dossier build
// Supposons que votre build React se trouve dans un dossier 'build' ou 'client/build'
// Ajustez le chemin selon votre structure de projet
app.use(express.static(path.join(__dirname, "client/build")));

// Toutes les requêtes non API sont dirigées vers index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: "An error occurred on the server" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
