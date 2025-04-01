// src/games/lol/config.ts
import { ThemeConfig } from "../../core/types";
import { LolPlayerData } from "./types";
import { fetchPlayerDetailsFromCargo } from "./api";

// Configuration du thème LoL
export const lolThemeConfig: ThemeConfig<LolPlayerData> = {
  gameName: "LEAGUE-LE",
  gameDescription: "Guess the mystery LoL player",
  maxAttempts: 8,

  // Définition des colonnes du tableau
  columns: [
    { id: "name", title: "NAME", renderer: "text", sortable: true },
    { id: "team", title: "TEAM", renderer: "text", sortable: true },
    {
      id: "league",
      title: "LEAGUE",
      renderer: "text",
      sortable: true,
      align: "center",
    },
    {
      id: "role",
      title: "POS",
      renderer: "text",
      sortable: true,
      align: "center",
    },
    {
      id: "country",
      title: "Pays", // Notez : utilisez 'title' au lieu de 'header' selon votre interface
      renderer: "flag", // Changez le renderer en "flag"
      align: "center",
    },
    {
      id: "age",
      title: "AGE",
      renderer: "text",
      sortable: true,
      align: "center",
    },
  ],

  // Mapping des couleurs pour les feedbacks visuels
  colorMapping: {
    exact: "bg-green-600 text-white", // Correspondance exacte (vert)
    similar: "bg-orange-500 text-white", // Correspondance partielle (orange)
    none: "bg-red-600 text-white", // Pas de correspondance (rouge)

    compare: (value, correctValue, columnId, allPlayers) => {
      // Pour le nom du joueur, pas de coloration
      if (columnId === "name") {
        return "";
      }

      // Si les valeurs sont exactement les mêmes, c'est une correspondance exacte
      if (value === correctValue) {
        return "bg-green-600 text-white";
      }

      // Logiques spécifiques pour différentes colonnes
      switch (columnId) {
        case "country":
          // Si la valeur correcte est N/A, on ne peut pas vraiment comparer
          if (correctValue === "N/A" || correctValue === "Inconnu") {
            return "bg-red-600 text-white";
          }

          // Normaliser et comparer
          const countryValue = String(value).trim().toLowerCase();
          const correctCountryValue = String(correctValue).trim().toLowerCase();

          return countryValue === correctCountryValue
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white";

        case "age":
          // Si la valeur correcte est N/A, on ne peut pas comparer les âges
          if (correctValue === "N/A" || correctValue === "Inconnu") {
            return "bg-red-600 text-white";
          }

          // Conversion en nombres pour la comparaison
          const ageValue = parseInt(String(value).replace(/\D/g, ""));
          const correctAgeValue = parseInt(
            String(correctValue).replace(/\D/g, "")
          );

          if (!isNaN(ageValue) && !isNaN(correctAgeValue)) {
            const diff = Math.abs(ageValue - correctAgeValue);
            if (diff === 0) {
              return "bg-green-600 text-white";
            } else if (diff <= 3) {
              return "bg-orange-500 text-white";
            }
          }
          return "bg-red-600 text-white";

        case "league":
          return value === correctValue
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white";

        case "role":
          return value === correctValue
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white";

        case "team":
          if (allPlayers) {
            const guessTeam = allPlayers.find((p) => p.team === value);
            const targetTeam = allPlayers.find((p) => p.team === correctValue);

            if (
              guessTeam &&
              targetTeam &&
              guessTeam.league === targetTeam.league
            ) {
              return "bg-orange-500 text-white";
            }
          }
          return "bg-red-600 text-white";

        default:
          return "bg-red-600 text-white";
      }
    },
  },

  // Fonction pour enrichir les détails d'un joueur avec des données supplémentaires
  // Dans lolThemeConfig, la fonction enrichPlayerDetails
  enrichPlayerDetails: async (
    player: LolPlayerData
  ): Promise<LolPlayerData> => {
    // Vérifier si les données sont déjà présentes pour éviter des appels inutiles
    if (player.country !== "N/A" && player.age !== "N/A") {
      // Si les données existent déjà mais pas le countryCode, essayer de le dériver
      if (!player.countryCode && player.country !== "N/A") {
        const countryCode = getCountryCode(player.country);
        if (countryCode) {
          console.log(
            `enrichPlayerDetails - Code pays dérivé pour ${player.name}: ${countryCode}`
          );
          player.countryCode = countryCode;
        }
      }
      return player;
    }

    try {
      // Appel de la fonction existante avec les paramètres disponibles
      const result = await fetchPlayerDetailsFromCargo(
        player.name,
        player.team,
        player.league,
        player.role
      );

      // Déterminer le code du pays
      let countryCode = result.countryCode;
      if (!countryCode && result.country && result.country !== "N/A") {
        countryCode = getCountryCode(result.country);
        console.log(
          `enrichPlayerDetails - Code pays dérivé pour ${player.name}: ${countryCode}`
        );
      }

      // Construire l'objet joueur enrichi
      const enrichedPlayer = {
        ...player,
        country: result.country || "N/A",
        countryCode: countryCode || undefined,
        age: result.age || "N/A",
      };

      // Ajouter l'image seulement si elle existe
      if (result.image) {
        enrichedPlayer.image = result.image;
      }

      // Ajouter les réseaux sociaux seulement s'ils existent
      if (result.socialMedia) {
        enrichedPlayer.socialMedia = result.socialMedia;
      }

      // Ajouter les champions signatures s'ils existent
      if (result.signatureChampions && result.signatureChampions.length > 0) {
        enrichedPlayer.signatureChampions = result.signatureChampions;
      } else {
        enrichedPlayer.signatureChampions = [];
      }

      return enrichedPlayer;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails pour ${player.name}:`,
        error
      );
      return {
        ...player,
        country: "N/A",
        age: "N/A",
        image: player.image,
        signatureChampions: [],
      };
    }
  },
};
