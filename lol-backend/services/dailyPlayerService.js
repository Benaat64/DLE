// services/dailyPlayerService.js

// Liste des ligues majeures, uniquement celles-ci seront utilisées pour le joueur du jour
const MAJOR_LEAGUES = ["LEC", "LCK", "LCS", "LPL", "LTA North", "LTA South"];

// Fonction pour obtenir le joueur quotidien
const getDailyPlayer = async (leagueFilter = null) => {
  try {
    // 1. Récupérer tous les joueurs depuis l'API
    const url =
      "https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US";
    const apiKey = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

    const response = await fetch(url, {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    // 2. Déterminer les ligues à utiliser
    const leaguesToUse = leagueFilter
      ? [leagueFilter.toUpperCase()]
      : MAJOR_LEAGUES;

    console.log("Ligues utilisées pour la sélection:", leaguesToUse);

    // 3. Filtrer les équipes des ligues majeures sélectionnées UNIQUEMENT
    const filteredTeams = data.data.teams.filter((team) => {
      const leagueName = team.homeLeague?.name;
      return leagueName && leaguesToUse.includes(leagueName);
    });

    if (filteredTeams.length === 0) {
      throw new Error(
        `Aucune équipe trouvée pour les ligues: ${leaguesToUse.join(", ")}`
      );
    }

    console.log(`Équipes filtrées pour la sélection: ${filteredTeams.length}`);

    // 4. Extraire tous les joueurs de ces équipes
    const allPlayers = filteredTeams.flatMap((team) =>
      team.players.map((player) => ({
        id: player.summonerName,
        name: player.summonerName,
        team: team.name,
        league: team.homeLeague?.name,
        role: player.role,
        image: player.image || null,
      }))
    );

    if (allPlayers.length === 0) {
      throw new Error("Aucun joueur trouvé");
    }

    console.log(`Nombre total de joueurs disponibles: ${allPlayers.length}`);

    // 5. Sélectionner un joueur quotidien basé sur la date
    const dailyPlayer = selectDailyPlayer(allPlayers, leagueFilter);

    console.log(
      "Joueur quotidien sélectionné:",
      dailyPlayer.name,
      "de",
      dailyPlayer.team,
      "dans",
      dailyPlayer.league
    );

    return dailyPlayer;
  } catch (error) {
    console.error("Erreur dans dailyPlayerService:", error);
    throw error;
  }
};

// Fonction pour sélectionner un joueur basé sur la date
const selectDailyPlayer = (players, leagueFilter = null) => {
  // Générer une graine basée sur la date du jour
  const now = new Date();
  const dateString = `${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}`;

  // Combiner avec leagueFilter si fourni pour avoir des joueurs différents par ligue
  const seedString = leagueFilter ? `${dateString}${leagueFilter}` : dateString;

  // Générer un nombre pseudo-aléatoire basé sur la date
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0; // Convertir en entier 32 bits
  }

  // Sélectionner un joueur basé sur le hash
  const index = Math.abs(hash) % players.length;
  return players[index];
};

module.exports = {
  getDailyPlayer,
  MAJOR_LEAGUES,
};
