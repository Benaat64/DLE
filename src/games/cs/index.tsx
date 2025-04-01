import GameTable from "../../components/GameTable";
// import { playerData, columns } from "./data/players";

function CSGame() {
  // Logique spécifique au jeu CS ici

  return (
    <div>
      <h1 className="text-4xl font-bold text-white text-center mb-2">
        COUNTER-STRIKLE
      </h1>
      <p className="text-xl text-gray-300 text-center mb-8">
        Guess the mystery CS player
      </p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="You're on a roll!"
          className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700"
        />
      </div>

      <GameTable columns={columns} data={playerData} className="mb-8" />
    </div>
  );
}

export default CSGame;
