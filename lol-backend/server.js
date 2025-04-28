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

// Important: où se trouve le dossier de build de votre frontend par rapport à server.js?
// Si votre frontend est construit dans un dossier 'dist' ou 'build' à la racine du projet:
const distPath = path.join(__dirname, "../dist"); // Ajustez ce chemin selon votre structure

// Servir les fichiers statiques
app.use(express.static(distPath));

// TRÈS IMPORTANT: toutes les requêtes qui ne correspondent pas à une API ou un fichier statique
// doivent être redirigées vers index.html pour que React Router prenne le relais
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
