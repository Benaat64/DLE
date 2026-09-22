const playerCache = new Map();
const pendingPlayers = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const queryPlayers = async (fields, where) => {
  const url = new URL("https://lol.fandom.com/api.php");
  url.search = new URLSearchParams({
    action: "cargoquery",
    tables: "Players",
    fields,
    where,
    format: "json",
  }).toString();

  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    throw new Error(`Leaguepedia HTTP ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`Leaguepedia ${data.error.code}: ${data.error.info}`);
  }
  return data.cargoquery || [];
};

const getPlayerInfoUncached = async (playerName, team, league, role, cacheKey) => {
  try {
    console.log(`=== Début getPlayerInfo pour: ${playerName} ===`);

    // Liste mise à jour des champs basée sur le schéma CargoTables/Players
    const fields =
      "Player,Country,Nationality,NationalityPrimary,Birthdate,Team,Role,IsRetired,Image,Twitter,Facebook,Instagram,Stream,Discord,Threads,FavChamps";

    const safeName = playerName.trim().replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const where = `Player="${safeName}" OR Player LIKE "${safeName} (%"`;
    const results = await queryPlayers(fields, where);
    const normalizedName = playerName.trim().toLowerCase();
    const normalizedTeam = team?.trim().toLowerCase();
    const normalizedRole = role?.trim().toLowerCase();
    const matches = results.map((entry) => entry.title).filter(Boolean);
    const score = (player) =>
      (normalizedTeam && player.Team?.toLowerCase() === normalizedTeam ? 16 : 0) +
      (player.Player?.toLowerCase() === normalizedName ? 8 : 0) +
      (player.Role?.toLowerCase() === normalizedRole ? 2 : 0) +
      (player.IsRetired === true ? 0 : 1);
    const playerInfo = matches.sort((a, b) => score(b) - score(a))[0];

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

    playerCache.set(cacheKey, { data: result, timestamp: Date.now() });

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

const getPlayerInfo = async (playerName, team, league, role) => {
  const cacheKey = `${playerName.trim().toLowerCase()}|${team?.trim().toLowerCase() || ""}`;
  const cached = playerCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  if (pendingPlayers.has(cacheKey)) return pendingPlayers.get(cacheKey);

  const pending = getPlayerInfoUncached(playerName, team, league, role, cacheKey);
  pendingPlayers.set(cacheKey, pending);
  try {
    return await pending;
  } finally {
    pendingPlayers.delete(cacheKey);
  }
};

module.exports = {
  getPlayerInfo,
};
