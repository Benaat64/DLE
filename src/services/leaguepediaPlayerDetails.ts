// src/services/leaguepediaPlayerDetails.ts
import axios from "axios";

// Point d'entrée de l'API
const LEAGUEPEDIA_API_URL = "https://lol.fandom.com/api.php";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

// Cache pour les détails des joueurs
const playerDetailsCache: Record<
  string,
  { data: PlayerDetailedStats; timestamp: number }
> = {};

// Interface pour les statistiques détaillées des joueurs
export interface PlayerDetailedStats {
  kills: number;
  deaths: number;
  assists: number;
  gamesPlayed: number;
  wins: number;
  csPerMinute: number;
  goldPerMinute: number;
  damagePerMinute: number;
  visionScore: number;
  mostPlayedChampions: { name: string; games: number; winRate: number }[];
}

// Interface pour les données de champion de Leaguepedia
interface LeaguepediaChampionStats {
  Champion: string;
  Games: number;
  Wins: number;
  Losses: number;
  WinRate: number;
}

/**
 * Récupère les statistiques détaillées d'un joueur depuis Leaguepedia
 */
export const fetchPlayerDetailedStats = async (
  playerId: string,
  playerName: string
): Promise<PlayerDetailedStats> => {
  // Vérifier si les données sont en cache et encore valides
  if (
    playerDetailsCache[playerId] &&
    Date.now() - playerDetailsCache[playerId].timestamp < CACHE_DURATION
  ) {
    return playerDetailsCache[playerId].data;
  }

  try {
    // Récupérer les statistiques détaillées du joueur
    const playerStatsResponse = await axios.get(LEAGUEPEDIA_API_URL, {
      params: {
        action: "cargoquery",
        tables: "PlayerStats",
        fields:
          "TotalGames, WinCount, AverageKills, AverageDeaths, AverageAssists, CSPerMinute, GoldPerMinute, DamagePerMinute, VisionScore",
        where: `ID="${playerId}" OR Name="${playerName}"`,
        format: "json",
        limit: "1",
      },
    });

    // Récupérer les champions les plus joués par le joueur
    const championStatsResponse = await axios.get(LEAGUEPEDIA_API_URL, {
      params: {
        action: "cargoquery",
        tables: "PlayerChampionStats",
        fields: "Champion, Games, Wins, Losses, WinRate",
        where: `Player="${playerName}"`,
        format: "json",
        limit: "10",
        order_by: "Games DESC",
      },
    });

    // Extraire les statistiques générales
    let playerStats = {
      kills: 0,
      deaths: 0,
      assists: 0,
      gamesPlayed: 0,
      wins: 0,
      csPerMinute: 0,
      goldPerMinute: 0,
      damagePerMinute: 0,
      visionScore: 0,
      mostPlayedChampions: [] as {
        name: string;
        games: number;
        winRate: number;
      }[],
    };

    // Traiter les statistiques générales si disponibles
    if (
      playerStatsResponse.data.cargoquery &&
      playerStatsResponse.data.cargoquery.length > 0
    ) {
      const stats = playerStatsResponse.data.cargoquery[0].title;
      playerStats = {
        ...playerStats,
        kills: parseFloat(stats.AverageKills || "0"),
        deaths: parseFloat(stats.AverageDeaths || "0"),
        assists: parseFloat(stats.AverageAssists || "0"),
        gamesPlayed: parseInt(stats.TotalGames || "0", 10),
        wins: parseInt(stats.WinCount || "0", 10),
        csPerMinute: parseFloat(stats.CSPerMinute || "0"),
        goldPerMinute: parseFloat(stats.GoldPerMinute || "0"),
        damagePerMinute: parseFloat(stats.DamagePerMinute || "0"),
        visionScore: parseFloat(stats.VisionScore || "0"),
      };
    }

    // Traiter les statistiques des champions si disponibles
    if (
      championStatsResponse.data.cargoquery &&
      championStatsResponse.data.cargoquery.length > 0
    ) {
      playerStats.mostPlayedChampions =
        championStatsResponse.data.cargoquery.map((item: any) => {
          const championStat = item.title as LeaguepediaChampionStats;
          return {
            name: championStat.Champion,
            games: parseInt(championStat.Games?.toString() || "0", 10),
            winRate: parseFloat(championStat.WinRate?.toString() || "0"),
          };
        });
    }

    // Si aucune donnée n'est disponible, utiliser des données par défaut
    if (playerStats.gamesPlayed === 0) {
      return getMockPlayerStats(playerId);
    }

    // Mettre en cache
    playerDetailsCache[playerId] = {
      data: playerStats,
      timestamp: Date.now(),
    };

    return playerStats;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du joueur:",
      error
    );
    // Utiliser les données de test en cas d'erreur
    return getMockPlayerStats(playerId);
  }
};

/**
 * Obtient les données mock pour les détails d'un joueur
 */
export const getMockPlayerStats = (playerId: string): PlayerDetailedStats => {
  // Données par défaut
  const defaultStats: PlayerDetailedStats = {
    kills: 3.5,
    deaths: 2.8,
    assists: 5.2,
    gamesPlayed: 20,
    wins: 10,
    csPerMinute: 7.8,
    goldPerMinute: 385,
    damagePerMinute: 495,
    visionScore: 25,
    mostPlayedChampions: [
      { name: "Champion 1", games: 5, winRate: 60 },
      { name: "Champion 2", games: 4, winRate: 50 },
      { name: "Champion 3", games: 3, winRate: 67 },
    ],
  };

  // Données spécifiques pour certains joueurs
  const mockData: Record<string, PlayerDetailedStats> = {
    // Faker
    "1": {
      kills: 4.2,
      deaths: 2.1,
      assists: 5.7,
      gamesPlayed: 35,
      wins: 22,
      csPerMinute: 8.9,
      goldPerMinute: 428,
      damagePerMinute: 587,
      visionScore: 32,
      mostPlayedChampions: [
        { name: "Azir", games: 7, winRate: 71 },
        { name: "Orianna", games: 6, winRate: 67 },
        { name: "Ahri", games: 5, winRate: 60 },
      ],
    },
    // Caps
    "2": {
      kills: 3.8,
      deaths: 2.5,
      assists: 6.1,
      gamesPlayed: 28,
      wins: 16,
      csPerMinute: 8.6,
      goldPerMinute: 411,
      damagePerMinute: 562,
      visionScore: 28,
      mostPlayedChampions: [
        { name: "Sylas", games: 8, winRate: 62 },
        { name: "LeBlanc", games: 5, winRate: 60 },
        { name: "Twisted Fate", games: 4, winRate: 50 },
      ],
    },
  };

  return mockData[playerId] || defaultStats;
};
