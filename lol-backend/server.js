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

// Le chemin vers le dossier dist à la RACINE du projet (pas dans lol-backend)
const distPath = path.join(__dirname, "../dist");
console.log(`Chemin vers le dossier dist: ${distPath}`);

// Servir les fichiers statiques depuis le dossier dist
app.use(express.static(distPath));

// Cette ligne est CRUCIALE : rediriger toutes les autres requêtes vers index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
