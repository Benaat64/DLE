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

// Servir les fichiers statiques du dossier dist (généré par Vite)
app.use(express.static(path.join(__dirname, "dist")));

// Toutes les requêtes non API sont dirigées vers index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
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
