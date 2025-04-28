import { LolPlayerData } from "./types";
// Import des icônes
import {
  FaTwitter,
  FaTwitch,
  FaInstagram,
  FaFacebook,
  FaDiscord,
} from "react-icons/fa";
import { PiThreadsLogoFill } from "react-icons/pi";
// Import des fonctions pour les drapeaux
import { getFlagImageUrl, getCountryCode } from "../../utils/countriesUtil";

interface PlayerDetailsProps {
  player: LolPlayerData;
  onClose: () => void;
}

const PlayerDetails = ({ player, onClose }: PlayerDetailsProps) => {
  if (!player) return null;

  // Construire l'URL Leaguepedia
  const getLeaguepediaUrl = (playerName: string) => {
    // Remplacer les espaces par des underscores pour le format d'URL
    const formattedName = playerName.replace(/\s/g, "_");
    return `https://lol.fandom.com/wiki/${formattedName}`;
  };

  // Vérifier si le joueur a des réseaux sociaux
  const hasSocialMedia =
    player.socialMedia &&
    Object.values(player.socialMedia).some((value) => !!value);

  console.log("Displaying player details:", player.name);
  console.log("Country:", player.country);
  console.log(
    "Country code:",
    player.countryCode || getCountryCode(player.country)
  );
  console.log("Available social media:", player.socialMedia);
  console.log("hasSocialMedia:", hasSocialMedia);

  // Gérer l'affichage du drapeau
  const renderFlag = () => {
    // Utiliser countryCode directement s'il existe, sinon essayer de le dériver du pays
    const code = player.countryCode || getCountryCode(player.country);

    if (code) {
      // Convertir null en undefined pour être compatible avec l'attribut src
      const flagUrl = getFlagImageUrl(code) || undefined;

      return (
        <img
          src={flagUrl}
          alt={player.nationalityPrimary || player.country}
          className="h-5 w-auto mr-2"
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-xl w-full overflow-hidden">
        {/* Header avec le nom du joueur */}
        <div className="bg-blue-900 py-2 px-4 text-center">
          <h2 className="text-xl font-bold text-white">{player.name}</h2>
        </div>

        {/* Photo du joueur */}
        <div className="bg-gray-700 p-4 flex justify-center">
          {player.image ? (
            <img
              src={player.image}
              alt={player.name}
              className="h-48 object-cover rounded"
            />
          ) : (
            <div className="h-48 w-40 bg-gray-800 flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
        </div>

        {/* Information de base */}
        <div className="border-t border-gray-600">
          <div className="bg-blue-900 py-2 px-4">
            <h3 className="text-white font-bold">Personal Information</h3>
          </div>

          <div className="text-white">
            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">Name</div>
              <div className="p-2 bg-gray-700">{player.name}</div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">Nationality</div>
              <div className="p-2 bg-gray-700 flex items-center">
                {renderFlag()}
                {player.nationalityPrimary || player.country || "N/A"}
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">Age</div>
              <div className="p-2 bg-gray-700">{player.age || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* Informations compétitives */}
        <div className="border-t border-gray-600">
          <div className="bg-blue-900 py-2 px-4">
            <h3 className="text-white font-bold">Competitive</h3>
          </div>

          <div className="text-white">
            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">Team</div>
              <div className="p-2 bg-gray-700">{player.team}</div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">League</div>
              <div className="p-2 bg-gray-700">{player.league}</div>
            </div>

            <div className="grid grid-cols-2 border-b border-gray-600">
              <div className="p-2 bg-gray-800 font-medium">Role</div>
              <div className="p-2 bg-gray-700">{player.role}</div>
            </div>

            {player.signatureChampions &&
              player.signatureChampions.length > 0 && (
                <div className="grid grid-cols-2 border-b border-gray-600">
                  <div className="p-2 bg-gray-800 font-medium">
                    Signature Champions
                  </div>
                  <div className="p-2 bg-gray-700 flex flex-wrap gap-1">
                    {player.signatureChampions.map((champion, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-600 px-2 rounded text-sm"
                      >
                        {champion}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Réseaux sociaux avec icônes */}
        {hasSocialMedia && (
          <div className="border-t border-gray-600">
            <div className="bg-blue-900 py-2 px-4">
              <h3 className="text-white font-bold">Social Media</h3>
            </div>

            <div className="p-3 bg-gray-700 flex flex-wrap gap-4 justify-center">
              {player.socialMedia?.twitter && (
                <a
                  href={player.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  title="Twitter"
                >
                  <FaTwitter size={24} />
                </a>
              )}

              {player.socialMedia?.twitch && (
                <a
                  href={player.socialMedia.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  title="Twitch"
                >
                  <FaTwitch size={24} />
                </a>
              )}

              {player.socialMedia?.instagram && (
                <a
                  href={player.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white hover:opacity-90 transition-opacity"
                  title="Instagram"
                >
                  <FaInstagram size={24} />
                </a>
              )}

              {player.socialMedia?.facebook && (
                <a
                  href={player.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors"
                  title="Facebook"
                >
                  <FaFacebook size={24} />
                </a>
              )}

              {player.socialMedia?.discord && (
                <a
                  href={player.socialMedia.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  title="Discord"
                >
                  <FaDiscord size={24} />
                </a>
              )}

              {player.socialMedia?.tiktok && (
                <a
                  href={player.socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-black text-white hover:bg-gray-900 transition-colors"
                  title={
                    player.socialMedia.tiktok.includes("threads.net")
                      ? "Threads"
                      : "TikTok"
                  }
                >
                  <PiThreadsLogoFill size={24} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Liens */}
        <div className="p-4 bg-gray-700 flex justify-between items-center">
          <a
            href={getLeaguepediaUrl(player.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            View on Leaguepedia
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;
