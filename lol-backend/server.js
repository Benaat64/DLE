const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const lolRoutes = require("./routes/lolRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware essentiels
app.use(cors());
app.use(bodyParser.json());

// Routes API
app.use("/api", lolRoutes);

// Servir les fichiers statiques depuis le dossier dist
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// Toutes les requêtes non API sont dirigées vers index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
