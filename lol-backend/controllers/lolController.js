// controllers/lolController.js - Contrôleurs pour les routes LoL
const leaguepediaService = require("../services/leaguepediaService");
const dailyPlayerService = require("../services/dailyPlayerService");

// Fonction pour récupérer les joueurs LoL
const getLolPlayers = async (req, res) => {
  try {
    const url =
      "https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US";
    const apiKey = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

    console.log("Tentative de récupération des joueurs...");

    // Faire la requête à l'API Esports
    const response = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });

    // Vérifier si la réponse est OK
    if (!response.ok) {
      console.error("Erreur HTTP:", response.status, response.statusText);
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    // Récupérer les données JSON
    const data = await response.json();
    console.log(
      `Données reçues de l'API Esports: ${data.data.teams.length} équipes au total`
    );

    // Utiliser la liste des ligues majeures du service dailyPlayer
    const majorLeagues = dailyPlayerService.MAJOR_LEAGUES;

    // Filtrer les équipes pour ne conserver que celles des ligues majeures
    const filteredTeams = data.data.teams.filter((team) =>
      majorLeagues.includes(team.homeLeague?.name)
    );

    console.log(`Équipes filtrées: ${filteredTeams.length}`);

    // Transformer les données en format GameData
    const players = filteredTeams.flatMap((team) =>
      team.players.map((player) => ({
        id: player.summonerName,
        name: player.summonerName,
        team: team.name,
        league: team.homeLeague?.name || "N/A",
        role: player.role,
        image: player.image || "N/A",
        country: "N/A", // À remplir plus tard
        age: "N/A", // À remplir plus tard
        isRetired: false, // Valeur par défaut, à remplir plus tard
      }))
    );

    console.log(`Joueurs filtrés: ${players.length}`);

    res.json(players);
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des joueurs" });
  }
};

// Fonction pour obtenir les détails d'un joueur
const getPlayerDetails = async (req, res) => {
  try {
    const { playerName, team, league, role } = req.query;
    if (!playerName) {
      return res
        .status(400)
        .json({ error: "Le paramètre playerName est requis" });
    }

    // Utiliser le service Leaguepedia avec équipe et rôle si disponibles
    const playerDetails = await leaguepediaService.getPlayerInfo(
      playerName,
      team,
      league,
      role
    );
    res.json(playerDetails);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du joueur:",
      error
    );
    res.json({
      nationalityPrimary: "Inconnu",
      countryCode: null,
      age: "N/A",
    });
  }
};

// Fonction pour récupérer le joueur quotidien
const getDailyPlayer = async (req, res) => {
  try {
    const { league } = req.query;

    // Récupérer le joueur quotidien, filtré par ligue si spécifiée
    const dailyPlayer = await dailyPlayerService.getDailyPlayer(league);

    res.json(dailyPlayer);
  } catch (error) {
    console.error("Erreur lors de la récupération du joueur quotidien:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getLolPlayers,
  getPlayerDetails,
  getDailyPlayer,
};
