import { useEffect, useState } from "react";

// Définition du type pour getTimeUntilNextGame
interface CountdownTimerProps {
  getTimeUntilNextGame: () => number;
}

// Composant de timer pour afficher le temps restant jusqu'à la prochaine partie
const CountdownTimer = ({ getTimeUntilNextGame }: CountdownTimerProps) => {
  const [remainingTime, setRemainingTime] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Calculer le temps initial
    const updateRemainingTime = () => {
      const msRemaining = getTimeUntilNextGame();

      // Convertir en heures, minutes, secondes
      const hours = Math.floor(msRemaining / (1000 * 60 * 60));
      const minutes = Math.floor(
        (msRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

      setRemainingTime({ hours, minutes, seconds });

      // Si c'est minuit, recharger la page
      if (msRemaining <= 0) {
        window.location.reload();
      }
    };

    // Mettre à jour immédiatement
    updateRemainingTime();

    // Puis toutes les secondes
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilNextGame]);

  // Formater pour toujours afficher 2 chiffres
  const format = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center justify-center bg-gray-800 rounded-lg p-4 text-3xl font-mono">
      <div className="flex items-center">
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.hours)}</span>
          <span className="text-xs text-gray-400">hours</span>
        </div>
        <span className="text-white">:</span>
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.minutes)}</span>
          <span className="text-xs text-gray-400">min</span>
        </div>
        <span className="text-white">:</span>
        <div className="flex flex-col items-center mx-2">
          <span className="text-white">{format(remainingTime.seconds)}</span>
          <span className="text-xs text-gray-400">sec</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
