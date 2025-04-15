// components/GameSelection.tsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Game {
  id: string;
  name: string;
  hasLeagues?: boolean;
  color: string;
  icon?: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  isAvailable: boolean;
}

// Catégories disponibles
const categories: Category[] = [
  {
    id: "esport",
    name: "Esport",
    isAvailable: true,
  },
  {
    id: "sport",
    name: "Sport",
    isAvailable: false,
  },
  {
    id: "entertainment",
    name: "Entertainment",
    isAvailable: false,
  },
];

// Liste complète des jeux par catégorie
const allGames: Game[] = [
  // Esport
  {
    id: "cs",
    name: "Counter-Strikle",
    color: "from-yellow-600 to-orange-700",
    icon: "🔫",
    category: "esport",
  },
  {
    id: "lol",
    name: "League-le",
    hasLeagues: true,
    color: "from-blue-600 to-purple-700",
    icon: "🏆",
    category: "esport",
  },
  {
    id: "valorant",
    name: "Valorant-le",
    color: "from-red-600 to-red-900",
    icon: "🎯",
    category: "esport",
  },
  // Sport
  {
    id: "football",
    name: "Football-le",
    hasLeagues: true,
    color: "from-green-600 to-green-900",
    icon: "⚽",
    category: "sport",
  },
  {
    id: "basketball",
    name: "NBA-le",
    hasLeagues: true,
    color: "from-orange-500 to-orange-800",
    icon: "🏀",
    category: "sport",
  },
  // Entertainment
  {
    id: "movies",
    name: "Movie-le",
    color: "from-blue-700 to-purple-900",
    icon: "🎬",
    category: "entertainment",
  },
  {
    id: "music",
    name: "Music-le",
    color: "from-pink-600 to-purple-800",
    icon: "🎵",
    category: "entertainment",
  },
];

const GameSelection = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("esport");

  const selectGame = (gameId: string, hasLeagues: boolean = false) => {
    if (hasLeagues) {
      navigate(`/${gameId}`); // Navigue vers la sélection de ligue
    } else {
      navigate(`/${gameId}/play`); // Navigue directement vers le jeu
    }
  };

  // Filtrer les jeux par catégorie active
  const filteredGames = allGames.filter(
    (game) => game.category === activeCategory
  );

  // Vérifier si la catégorie est disponible
  const isCategoryAvailable =
    categories.find((c) => c.id === activeCategory)?.isAvailable || false;

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <h1 className="text-5xl font-bold text-white text-center mb-8">
          DLE GAMES
        </h1>
        <p className="text-xl text-gray-300 text-center mb-8">
          Choose your game
        </p>

        {/* Sélection des catégories */}
        <div className="flex justify-center mb-10 space-x-4">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              <button
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 transform
                  ${
                    activeCategory === category.id ? "scale-105 shadow-lg " : ""
                  } 
                  ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : category.isAvailable
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-70"
                  }`}
                disabled={!category.isAvailable}
              >
                {category.name}
              </button>

              {/* Badge "Coming Soon" pour les catégories non disponibles */}
              {!category.isAvailable && (
                <div className="absolute -top-3 -right-3 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full transform -rotate-12 shadow-lg">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <button
              key={game.id}
              onClick={() =>
                isCategoryAvailable && selectGame(game.id, game.hasLeagues)
              }
              className={`p-6 rounded-lg bg-gradient-to-br ${game.color} 
                        hover:shadow-lg transform hover:-translate-y-1 
                        transition-all duration-200 text-left
                        ${
                          !isCategoryAvailable
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
              disabled={!isCategoryAvailable}
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
