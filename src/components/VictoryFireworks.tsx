// src/components/VictoryConfetti.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { LolPlayerData } from "../games/lol/types";
// Import des fonctions pour les drapeaux
import Flag from "./Flag";

interface VictoryConfettiProps {
  show: boolean;
  player: LolPlayerData | null;
  onClose: () => void;
}

const VictoryConfetti = ({ show, player, onClose }: VictoryConfettiProps) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [cardVisible, setCardVisible] = useState(false);
  const [confettiOpacity, setConfettiOpacity] = useState(1);
  const [numberOfPieces, setNumberOfPieces] = useState(200);

  // Fonction pour obtenir l'URL Leaguepedia
  const getLeaguepediaUrl = (playerName: string) => {
    // Remplacer les espaces par des underscores pour le format d'URL
    const formattedName = playerName.replace(/\s/g, "_");
    return `https://lol.fandom.com/wiki/${formattedName}`;
  };

  // Fonction de rendu du drapeau
  const renderFlag = () => {
    if (!player) return null;
    return (
      <Flag
        country={player.nationalityPrimary || player.country}
        countryCode={player.countryCode}
        className="h-5 w-auto mr-2"
      />
    );
  };

  // Mettre à jour les dimensions en cas de redimensionnement
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Gérer les transitions de l'animation
  useEffect(() => {
    if (show) {
      // Réinitialiser les états
      setConfettiOpacity(1);
      setNumberOfPieces(200);

      // Afficher la carte après 800ms
      const cardTimer = setTimeout(() => {
        setCardVisible(true);
      }, 800);

      // Commencer à réduire progressivement le nombre de confettis et l'opacité
      const fadeTimer = setTimeout(() => {
        const interval = setInterval(() => {
          setNumberOfPieces((prev) => Math.max(0, prev - 10));
          setConfettiOpacity((prev) => {
            const newValue = prev - 0.05;
            return newValue > 0 ? newValue : 0;
          });
        }, 300);

        return () => clearInterval(interval);
      }, 4000);

      return () => {
        clearTimeout(cardTimer);
        clearTimeout(fadeTimer);
      };
    } else {
      setCardVisible(false);
    }
  }, [show]);

  if (!show || !player) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Confetti avec fondu de sortie progressive */}
      <div style={{ opacity: confettiOpacity }}>
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={numberOfPieces}
          gravity={0.3}
          initialVelocityY={10}
          tweenDuration={5000}
          colors={[
            "#26ccff",
            "#a25afd",
            "#ff5e7e",
            "#88ff5a",
            "#fcff42",
            "#ffa62d",
            "#ff36ff",
          ]}
        />
      </div>

      {/* Barre de victoire simple en haut de l'écran */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-green-700 text-white text-center py-3 font-bold text-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        Victoire !
        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-2xl">
          🏆
        </span>
      </motion.div>

      {/* Carte avec les détails du joueur */}
      <AnimatePresence>
        {cardVisible && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div
              className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="bg-green-700 py-3 px-4 text-center">
                <h2 className="text-2xl font-bold text-white">
                  Le joueur était
                </h2>
              </div>

              {/* Photo et détails du joueur */}
              <div className="flex flex-col md:flex-row">
                <div className="p-4 flex-shrink-0 flex justify-center">
                  {player.image ? (
                    <img
                      src={player.image}
                      alt={player.name}
                      className="h-40 w-40 object-cover rounded-lg border-2 border-yellow-400"
                    />
                  ) : (
                    <div className="h-40 w-40 bg-gray-700 flex items-center justify-center rounded-lg">
                      <span className="text-4xl">👑</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {player.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-gray-400">Équipe:</span>
                      <div className="text-white font-medium">
                        {player.team}
                      </div>
                    </div>

                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-gray-400">Rôle:</span>
                      <div className="text-white font-medium">
                        {player.role}
                      </div>
                    </div>

                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-gray-400">Ligue:</span>
                      <div className="text-white font-medium">
                        {player.league}
                      </div>
                    </div>

                    <div className="bg-gray-700 p-2 rounded">
                      <span className="text-gray-400">Nationalité:</span>
                      <div className="text-white font-medium flex items-center">
                        {renderFlag()}
                      </div>
                    </div>
                  </div>

                  {player.signatureChampions &&
                    player.signatureChampions.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-sm">
                          Champions favoris:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {player.signatureChampions.map((champion, index) => (
                            <span
                              key={index}
                              className="bg-blue-900 text-white text-xs px-2 py-1 rounded"
                            >
                              {champion}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="p-4 bg-gray-700 flex justify-between items-center">
                <a
                  href={getLeaguepediaUrl(player.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Voir sur Leaguepedia
                </a>

                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
                >
                  Continuer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VictoryConfetti;
