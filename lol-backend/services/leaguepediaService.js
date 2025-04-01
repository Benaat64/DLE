const getPlayerInfo = async (playerName, team, league, role) => {
  try {
    console.log(`=== Début getPlayerInfo pour: ${playerName} ===`);

    // Liste mise à jour des champs basée sur le schéma CargoTables/Players
    const fields =
      "Player,Country,Nationality,NationalityPrimary,Birthdate,Team,Role,IsRetired,Image,Twitter,Facebook,Instagram,Stream,Discord,Threads,FavChamps";

    // Tableau des stratégies de recherche à essayer dans l'ordre
    const searchStrategies = [
      // 1. Nom exact
      `Player="${encodeURIComponent(playerName)}" AND IsRetired=false`,
      // 2. Nom avec parenthèses - pour les formats comme "Wei (Yan Yang-Wei)"
      `Player LIKE "${encodeURIComponent(playerName)} (%" AND IsRetired=false`,
      // 3. Nom en tant que sous-chaîne (dernier recours)
      `Player LIKE "%${encodeURIComponent(playerName)}%" AND IsRetired=false`,
    ];

    let playerInfo = null;
    let allResults = [];

    // Essayer chaque stratégie jusqu'à trouver un résultat
    for (const strategy of searchStrategies) {
      const url = `https://lol.fandom.com/api.php?action=cargoquery&tables=Players&fields=${fields}&where=${strategy}&format=json`;
      console.log(`Essai avec stratégie: ${strategy}`);
      console.log(`URL complète: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.cargoquery && data.cargoquery.length > 0) {
        allResults = data.cargoquery;
        console.log(`Nombre de résultats trouvés: ${allResults.length}`);

        // Chercher un joueur actif avec une équipe
        const activePlayers = allResults.filter(
          (player) => player.title.Team && player.title.Team.trim() !== ""
        );

        if (activePlayers.length > 0) {
          // Prendre le DERNIER joueur actif (potentiellement le plus récent)
          playerInfo = activePlayers[activePlayers.length - 1].title;
          console.log(`Joueur actif trouvé (dernier): ${playerInfo.Player}`);
          break;
        }

        // Si aucun joueur actif avec équipe, prendre le DERNIER résultat
        playerInfo = allResults[allResults.length - 1].title;
        console.log(`Joueur trouvé (dernier résultat): ${playerInfo.Player}`);
        break;
      }
    }

    // Si aucun résultat n'a été trouvé avec les stratégies pour joueurs actifs, essayer sans le filtre IsRetired
    if (!playerInfo) {
      console.log(
        `Aucun résultat trouvé pour ${playerName} parmi les joueurs actifs, recherche élargie...`
      );
      // Stratégies sans filtre de retraite (au cas où la base de données n'a pas correctement marqué le statut)
      const fallbackStrategies = [
        `Player="${encodeURIComponent(playerName)}"`,
        `Player LIKE "${encodeURIComponent(playerName)} (%"`,
        `Player LIKE "%${encodeURIComponent(playerName)}%"`,
      ];

      for (const strategy of fallbackStrategies) {
        const url = `https://lol.fandom.com/api.php?action=cargoquery&tables=Players&fields=${fields}&where=${strategy}&format=json`;
        console.log(`Essai avec stratégie de secours: ${strategy}`);

        const response = await fetch(url);
        const data = await response.json();

        if (data.cargoquery && data.cargoquery.length > 0) {
          allResults = data.cargoquery;

          // Privilégier les joueurs non retraités
          const nonRetiredPlayers = allResults.filter(
            (player) => player.title.IsRetired !== true
          );

          if (nonRetiredPlayers.length > 0) {
            playerInfo = nonRetiredPlayers[nonRetiredPlayers.length - 1].title;
            console.log(`Joueur non retraité trouvé: ${playerInfo.Player}`);
            break;
          }

          // En dernier recours, prendre n'importe quel joueur
          playerInfo = allResults[allResults.length - 1].title;
          console.log(
            `Joueur trouvé (potentiellement retraité): ${playerInfo.Player}`
          );
          break;
        }
      }
    }

    // Si toujours aucun résultat
    if (!playerInfo) {
      console.log(`Aucun résultat trouvé pour ${playerName}`);
      return {
        country: "Inconnu",
        nationalityPrimary: null,
        age: "N/A",
      };
    }

    console.log("playerInfo brut:", playerInfo);

    // Calculer l'âge si la date de naissance est disponible
    let age = "N/A";
    if (playerInfo.Birthdate) {
      const birthDate = new Date(playerInfo.Birthdate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      // Ajuster l'âge si l'anniversaire n'a pas encore eu lieu cette année
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Logique pour NationalityPrimary:
    // 1. Utiliser NationalityPrimary si disponible
    // 2. Sinon, utiliser Nationality si disponible
    // 3. Sinon, utiliser Country comme dernier recours
    // 4. Finalement, "Inconnu" si aucun des champs n'est disponible
    const nationalityPrimary = playerInfo.NationalityPrimary
      ? playerInfo.NationalityPrimary
      : playerInfo.Nationality
      ? playerInfo.Nationality
      : playerInfo.Country
      ? playerInfo.Country
      : "Inconnu";

    // Formatage des champions signatures (utilisant FavChamps au lieu de SignatureChampions)
    const signatureChampions = playerInfo.FavChamps
      ? playerInfo.FavChamps.split(",").map((champ) => champ.trim())
      : [];

    // Log des données brutes des réseaux sociaux
    console.log("Données réseaux sociaux brutes:");
    console.log("Twitter:", playerInfo.Twitter);
    console.log("Facebook:", playerInfo.Facebook);
    console.log("Instagram:", playerInfo.Instagram);
    console.log("Stream:", playerInfo.Stream);
    console.log("Discord:", playerInfo.Discord);
    console.log("Threads:", playerInfo.Threads);

    // Construction de l'objet de réseaux sociaux avec formatage adapté
    const socialMedia = {
      // Formatter les valeurs incomplètes de Twitter
      twitter: playerInfo.Twitter
        ? playerInfo.Twitter.startsWith("http")
          ? playerInfo.Twitter
          : `https://twitter.com/${playerInfo.Twitter}`
        : null,

      // Facebook est généralement une URL complète
      facebook: playerInfo.Facebook || null,

      // Formatter les valeurs incomplètes d'Instagram
      instagram: playerInfo.Instagram
        ? playerInfo.Instagram.startsWith("http")
          ? playerInfo.Instagram
          : `https://www.instagram.com/${playerInfo.Instagram}`
        : null,

      // Stream peut être Twitch ou autre (comme AfreecaTV)
      twitch: playerInfo.Stream || null,

      // Formatter les valeurs incomplètes de Threads
      tiktok: playerInfo.Threads
        ? playerInfo.Threads.startsWith("http")
          ? playerInfo.Threads
          : `https://www.threads.net/@${playerInfo.Threads}`
        : null,

      // Discord est généralement une URL complète
      discord: playerInfo.Discord || null,
    };

    // Vérifier si au moins un réseau social a une valeur
    const hasSocialMedia = Object.values(socialMedia).some(
      (val) => val !== null && val !== ""
    );

    console.log(
      "Envoi des données de réseaux sociaux:",
      hasSocialMedia ? socialMedia : "Aucun réseau social trouvé"
    );

    const result = {
      country: nationalityPrimary || "Inconnu",

      age: age.toString(),
      isRetired: playerInfo.IsRetired === true,
      image: playerInfo.Image || null,
      socialMedia: hasSocialMedia ? socialMedia : null,
      signatureChampions,
    };

    console.log("Objet final renvoyé:", result);
    console.log("=== Fin getPlayerInfo ===");

    return result;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Leaguepedia:",
      error
    );
    return {
      country: "Inconnu",
      nationalityPrimary: null,
      age: "N/A",
      isRetired: false,
      image: null,
      socialMedia: null,
      signatureChampions: [],
    };
  }
};

module.exports = {
  getPlayerInfo,
};
