// components/GameSelection.tsx
import { useNavigate } from "react-router-dom";

interface Game {
  id: string;
  name: string;
  hasLeagues?: boolean;
  color: string;
  icon?: string;
}

const games: Game[] = [
  {
    id: "cs",
    name: "Counter-Strikle",
    color: "from-yellow-600 to-orange-700",
    icon: "🔫",
  },
  {
    id: "lol",
    name: "League-le",
    hasLeagues: true,
    color: "from-blue-600 to-purple-700",
    icon: "🏆",
  },
];

const GameSelection = () => {
  const navigate = useNavigate();

  const selectGame = (gameId: string, hasLeagues: boolean = false) => {
    if (hasLeagues) {
      navigate(`/${gameId}`); // Navigue vers la sélection de ligue
    } else {
      navigate(`/${gameId}`); // Navigue directement vers le jeu
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          DLE GAMES
        </h1>
        <p className="text-xl text-gray-300 text-center mb-12">
          Choose your game
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => selectGame(game.id, game.hasLeagues)}
              className={`p-6 rounded-lg bg-gradient-to-br ${game.color} 
                        hover:shadow-lg transform hover:-translate-y-1 
                        transition-all duration-200 text-left`}
            >
              <div className="flex items-center">
                {game.icon && (
                  <span className="text-4xl mr-4">{game.icon}</span>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{game.name}</h2>
                  <p className="text-white opacity-80">
                    Guess the {game.id.toUpperCase()} player
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
