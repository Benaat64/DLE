// src/services/leaguepediaApi.ts
import axios from "axios";
import { GameData } from "../components/GameTable/types";

// Configuration de base pour l'API Leaguepedia
const LEAGUEPEDIA_API_URL = "https://lol.fandom.com/api.php";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Interface pour le cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Interface pour les données de joueur Leaguepedia
interface LeaguepediaPlayer {
  ID: string;
  Name: string;
  Team: string;
  Role: string;
  Residency: string;
  Country: string;
  SoloqueueIds?: string;
  Image?: string;
}

// Interface pour les statistiques de joueur Leaguepedia
interface LeaguepediaPlayerStats {
  ID: string;
  TotalGames: number;
  WinCount: number;
  KDA: number;
  AverageKills: number;
  AverageDeaths: number;
  AverageAssists: number;
  ChampionsPlayed?: string; // Format: "Champion1:Games1:Wins1,Champion2:Games2:Wins2"
}

// Cache pour stocker les réponses
const cache: Record<string, CacheItem<any>> = {};

/**
 * Fonction utilitaire pour vérifier si une entrée du cache est valide
 */
const isCacheValid = (cacheKey: string): boolean => {
  if (!cache[cacheKey]) return false;

  const now = Date.now();
  return now - cache[cacheKey].timestamp < CACHE_DURATION;
};

/**
 * Fonction générique pour faire des requêtes à l'API Leaguepedia
 */
export const fetchFromLeaguepedia = async <T>(
  params: Record<string, string>,
  cacheKey?: string
): Promise<T> => {
  // Si une clé de cache est fournie et que le cache est valide, retourner les données du cache
  if (cacheKey && isCacheValid(cacheKey)) {
    console.log(`Utilisation du cache pour ${cacheKey}`);
    return cache[cacheKey].data;
  }

  try {
    // Paramètres par défaut pour toutes les requêtes
    const defaultParams = {
      action: "cargoquery",
      format: "json",
    };

    // Fusionner les paramètres par défaut avec ceux fournis
    const fullParams = { ...defaultParams, ...params };

    const response = await axios.get(LEAGUEPEDIA_API_URL, {
      params: fullParams,
    });

    const result = response.data;

    // Vérifier si la réponse est valide
    if (!result || !result.cargoquery) {
      throw new Error("Invalid API response format");
    }

    const data = result.cargoquery.map((item: any) => item.title);

    // Mettre en cache si une clé est fournie
    if (cacheKey) {
      cache[cacheKey] = {
        data: data as T,
        timestamp: Date.now(),
      };
    }

    return data as T;
  } catch (error) {
    console.error("Error fetching from Leaguepedia API:", error);
    throw error;
  }
};

/**
 * Récupère les joueurs actifs de Leaguepedia
 */
export const fetchLeaguepediaPlayers = async (): Promise<
  LeaguepediaPlayer[]
> => {
  const params = {
    tables: "Players",
    fields:
      "Players.ID, Players.Name, Players.Team, Players.Role, Players.Residency, Players.Country, Players.SoloqueueIds, Players.Image",
    where: 'Players.IsRetired=0 AND Players.Team!=""', // Seulement les joueurs actifs
    limit: "300", // Limite raisonnable
  };

  return fetchFromLeaguepedia<LeaguepediaPlayer[]>(params, "players");
};

/**
 * Récupère les statistiques des joueurs
 */
export const fetchLeaguepediaPlayerStats = async (): Promise<
  LeaguepediaPlayerStats[]
> => {
  const params = {
    tables: "PlayerStats",
    fields:
      "PlayerStats.ID, PlayerStats.TotalGames, PlayerStats.WinCount, PlayerStats.KDA, PlayerStats.AverageKills, PlayerStats.AverageDeaths, PlayerStats.AverageAssists, PlayerStats.ChampionsPlayed",
    where: "PlayerStats.TotalGames > 0", // Seulement les joueurs avec des statistiques
    limit: "300",
  };

  return fetchFromLeaguepedia<LeaguepediaPlayerStats[]>(params, "playerStats");
};

/**
 * Convertit le format de données Leaguepedia au format GameData pour l'application
 */
export const convertToGameData = (
  players: LeaguepediaPlayer[],
  stats: LeaguepediaPlayerStats[]
): GameData[] => {
  // Utilisation de 'as GameData[]' pour éviter l'erreur de type sans changer la structure de données existante
  return players.map((player) => {
    // Trouver les statistiques correspondantes
    const playerStats = stats.find((s) => s.ID === player.ID) || {
      TotalGames: 0,
      WinCount: 0,
      KDA: 0,
      AverageKills: 0,
      AverageDeaths: 0,
      AverageAssists: 0,
    };

    // Calculer le taux de victoire
    const winRate =
      playerStats.TotalGames > 0
        ? Math.round((playerStats.WinCount / playerStats.TotalGames) * 100)
        : 0;

    // Formater les données selon notre structure GameData
    return {
      id: player.ID,
      name: player.Name,
      team: player.Team,
      position: player.Role.toUpperCase(),
      nationality: player.Residency || player.Country || "N/A",
      kda: playerStats.KDA.toFixed(1),
      winRate: `${winRate}% ${winRate > 50 ? "↑" : "↓"}`,
      // Ajoutons les propriétés manquantes pour satisfaire le type GameData
      league: "", // Champ obligatoire
      role: player.Role, // Utilisons le rôle comme dans LeaguepediaPlayer
      image: player.Image || "", // Utilisons l'image si disponible
      country: player.Country || "", // Pays du joueur
      age: "N/A", // Information non disponible dans l'API, mettons une valeur par défaut
    } as GameData;
  });
};

/**
 * Fonction principale pour récupérer les données des joueurs au format attendu par l'application
 */
export const fetchLolPlayersFromLeaguepedia = async (): Promise<GameData[]> => {
  try {
    // Récupérer en parallèle les joueurs et leurs statistiques
    const [players, stats] = await Promise.all([
      fetchLeaguepediaPlayers(),
      fetchLeaguepediaPlayerStats(),
    ]);

    // Convertir au format GameData
    return convertToGameData(players, stats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Leaguepedia:",
      error
    );
    throw error;
  }
};
