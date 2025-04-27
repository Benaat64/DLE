import { DataAdapter } from "../../core/types";
import { LolPlayerData } from "./types";
import { getCountryCode } from "../../utils/countriesUtil";

// URL de base de l'API backend
const API_BASE_URL = "https://dlee-a2ew.onrender.com";

// Liste des ligues majeures à inclure
const MAJOR_LEAGUES = ["LEC", "LCK", "LCS", "LPL", "LTA North", "LTA South"];

interface EsportsResponse {
  data: {
    teams: Array<{
      name: string;
      homeLeague?: {
        name: string;
      };
      players: Array<{
        summonerName: string;
        role: string;
        image?: string;
      }>;
    }>;
  };
}

// Fonction pour récupérer les détails du joueur via notre serveur backend
export const fetchPlayerDetailsFromCargo = async (
  playerName: string,
  team?: string,
  league?: string,
  role?: string
): Promise<{
  country: string;
  countryCode?: string;
  age: string;
  image?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    twitch?: string;
    tiktok?: string;
    discord?: string;
  };
  signatureChampions?: string[];
}> => {
  try {
    console.log(`Chargement du joueur: ${playerName}`);
    const url = `${API_BASE_URL}/api/cargo?playerName=${encodeURIComponent(
      playerName
    )}${team ? `&team=${encodeURIComponent(team)}` : ""}${
      league ? `&league=${encodeURIComponent(league)}` : ""
    }${role ? `&role=${encodeURIComponent(role)}` : ""}`;

    // console.log(`Requête API details joueur: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    // console.log(`Données reçues pour ${playerName}:`, data);

    // Créer l'objet résultat
    const result: {
      country: string;
      countryCode?: string;
      age: string;
      image?: string;
      socialMedia?: {
        twitter?: string;
        facebook?: string;
        instagram?: string;
        twitch?: string;
        tiktok?: string;
        discord?: string;
      };
      signatureChampions?: string[];
    } = {
      country: data.country || "N/A",
      age: data.age || "N/A",
    };

    // Déterminer le code du pays
    if (data.countryCode) {
      result.countryCode = data.countryCode;
    } else if (data.country && data.country !== "N/A") {
      const countryCode = getCountryCode(data.country);
      if (countryCode) {
        result.countryCode = countryCode;
      }
    }

    // Ajouter l'image si disponible
    if (data.image) {
      result.image = data.image;
    }

    // Ajouter les réseaux sociaux seulement s'ils existent dans la réponse
    if (data.socialMedia) {
      const hasSocialMedia = Object.values(data.socialMedia).some(
        (val) => val !== null && val !== ""
      );

      if (hasSocialMedia) {
        result.socialMedia = {
          twitter: data.socialMedia.twitter || undefined,
          facebook: data.socialMedia.facebook || undefined,
          instagram: data.socialMedia.instagram || undefined,
          twitch: data.socialMedia.twitch || undefined,
          tiktok: data.socialMedia.tiktok || undefined,
          discord: data.socialMedia.discord || undefined,
        };
        // console.log("Réseaux sociaux trouvés:", result.socialMedia);
      }
    }

    // Ajouter les champions signatures s'ils existent
    if (data.signatureChampions && data.signatureChampions.length > 0) {
      result.signatureChampions = data.signatureChampions;
    }

    return result;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des détails du joueur:",
      error
    );
    return {
      country: "N/A",
      age: "N/A",
    };
  }
};

// Classe d'adaptateur pour l'API LoL
export class LolApiAdapter implements DataAdapter<LolPlayerData> {
  private leagueFilter: string[];

  constructor(leagueId: string = "all") {
    // Définir quelles ligues sont incluses
    if (leagueId === "all") {
      this.leagueFilter = MAJOR_LEAGUES;
    } else if (leagueId === "lta") {
      this.leagueFilter = ["LTA North", "LTA South"];
    } else if (leagueId.toLowerCase() === "lec") {
      // Spécifiquement pour LEC, exclure EMEA
      this.leagueFilter = ["LEC"]; // Uniquement LEC, pas EMEA
    } else {
      this.leagueFilter = [leagueId.toUpperCase()];
    }
  }

  // Récupérer tous les joueurs depuis l'API
  async fetchPlayers(): Promise<LolPlayerData[]> {
    try {
      const url =
        "https://esports-api.lolesports.com/persisted/gw/getTeams?hl=en-US";
      const apiKey = "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";

      const response = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data: EsportsResponse = await response.json();

      if (!data.data.teams || data.data.teams.length === 0) {
        throw new Error("Aucune équipe trouvée dans la réponse de l'API");
      }

      const players: LolPlayerData[] = [];
      const uniquePlayers = new Set<string>();

      data.data.teams.forEach((team) => {
        // Utiliser le filtre de ligue ici
        if (
          team.homeLeague?.name &&
          this.leagueFilter.includes(team.homeLeague.name)
        ) {
          team.players.forEach((player) => {
            if (!uniquePlayers.has(player.summonerName)) {
              uniquePlayers.add(player.summonerName);

              players.push({
                id: player.summonerName,
                name: player.summonerName,
                team: team.name,
                league: team.homeLeague?.name || "N/A",
                role: player.role,
                image: player.image || "",
                country: "N/A",
                age: "N/A",
                socialMedia: {
                  twitter: undefined,
                  facebook: undefined,
                  instagram: undefined,
                  twitch: undefined,
                  tiktok: undefined,
                  discord: undefined,
                },
                signatureChampions: [],
              });
            }
          });
        }
      });

      return players;
    } catch (error) {
      console.error("Erreur lors de la récupération des joueurs:", error);
      return [];
    }
  }

  // Implémenter la méthode getTestPlayers requise par l'interface DataAdapter
  async getTestPlayers(): Promise<LolPlayerData[]> {
    return [
      {
        id: "Faker",
        name: "Faker",
        team: "T1",
        league: "LCK",
        role: "MID",
        image: "",
        country: "South Korea",
        countryCode: "kr",
        age: "27",
        socialMedia: {
          twitter: undefined,
          facebook: undefined,
          instagram: undefined,
          twitch: undefined,
          tiktok: undefined,
          discord: undefined,
        },
        signatureChampions: ["Leblanc", "Zed", "Syndra"],
      },
      {
        id: "Caps",
        name: "Caps",
        team: "G2 Esports",
        league: "LEC",
        role: "MID",
        image: "",
        country: "Denmark",
        countryCode: "dk",
        age: "24",
        socialMedia: {
          twitter: undefined,
          facebook: undefined,
          instagram: undefined,
          twitch: undefined,
          tiktok: undefined,
          discord: undefined,
        },
        signatureChampions: ["Leblanc", "Sylas", "Akali"],
      },
      {
        id: "Rekkles",
        name: "Rekkles",
        team: "Fnatic",
        league: "LEC",
        role: "BOT",
        image: "",
        country: "Sweden",
        countryCode: "se",
        age: "27",
        socialMedia: {
          twitter: undefined,
          facebook: undefined,
          instagram: undefined,
          twitch: undefined,
          tiktok: undefined,
          discord: undefined,
        },
        signatureChampions: ["Jhin", "Sivir", "Tristana"],
      },
    ];
  }
}
