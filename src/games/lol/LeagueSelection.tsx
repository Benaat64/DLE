import { useNavigate } from "react-router-dom";

const LeagueSelection = () => {
  const navigate = useNavigate();

  const availableLeagues = [
    {
      id: "all",
      name: "All Leagues",
      image:
        "https://www.sheepesports.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F9rqbl8zs%2Fproduction%2Fb726c7b2058947e2c6358cb0eb5303c7bf7f7d29-1920x1080.webp&w=3840&q=75",
    },
    {
      id: "lec",
      name: "LEC",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/e/ef/League_of_Legends_EMEA_Championship.png",
    },
    {
      id: "lck",
      name: "LCK",
      image: "https://upload.wikimedia.org/wikipedia/fr/1/12/LCK_Logo.svg",
    },
    {
      id: "lpl",
      name: "LPL",
      image: "https://upload.wikimedia.org/wikipedia/fr/4/4a/LPL_LoL_Logo.png",
    },
    {
      id: "lta",
      name: "LTA",
      image:
        "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/League_of_Legends_Championship_of_The_Americas_logo.svg/640px-League_of_Legends_Championship_of_The_Americas_logo.svg.png",
    },
  ];

  const selectLeague = (leagueId: string) => {
    navigate(`/lol/play/${leagueId}`);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/")}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back to Home
        </button>
      </div>

      <h1 className="text-5xl font-bold text-white text-center mb-2 tracking-wider">
        LEAGUE-LE
      </h1>
      <p className="text-xl text-gray-300 text-center mb-10">
        Choose a league to start playing
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableLeagues.map((league) => (
          <div
            key={league.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 cursor-pointer transition-colors flex flex-col items-center"
            onClick={() => selectLeague(league.id)}
          >
            <div className="h-24 w-48 relative mb-4 overflow-hidden">
              <img
                src={league.image}
                alt={`${league.name} logo`}
                className="absolute w-full h-full object-contain"
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement d'image
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Éviter une boucle infinie

                  // Utiliser un emoji comme fallback basé sur l'ID de la ligue
                  const fallbacks: { [key: string]: string } = {
                    all: "🌎",
                    lec: "🇪🇺",
                    lck: "🇰🇷",
                    lpl: "🇨🇳",
                    lta: "🇺🇸",
                  };

                  // Créer un div avec l'emoji
                  const parent = target.parentNode as HTMLElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-5xl">${
                      fallbacks[league.id] || "🏆"
                    }</span>`;
                  }
                }}
              />
            </div>
            <h3 className="text-xl font-bold text-white">{league.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeagueSelection;
