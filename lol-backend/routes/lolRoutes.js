// routes/lolRoutes.js - Routes pour l'API League of Legends
const express = require("express");
const router = express.Router();
const lolController = require("../controllers/lolController");

// Route pour récupérer les joueurs LoL
router.get("/lol/players", lolController.getLolPlayers);

// Route pour récupérer les détails d'un joueur depuis Leaguepedia
router.get("/cargo", lolController.getPlayerDetails);

router.get("/daily-player", lolController.getDailyPlayer);
module.exports = router;
