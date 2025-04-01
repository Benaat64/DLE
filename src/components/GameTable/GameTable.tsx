import { Column, GameData, ColorMapping } from "./types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface GameTableProps {
  columns: Column[];
  data: GameData[];
  correctData?: GameData;
  colorMapping?: ColorMapping;
  className?: string;
  allPlayers?: GameData[]; // Ajouter cette prop
  onRowClick?: (player: GameData) => void; // Ajouter cette prop
}

function GameTable({
  columns,
  data,
  correctData,
  colorMapping,
  className = "",
  allPlayers,
  onRowClick,
}: GameTableProps) {
  return (
    <div
      className={`game-table rounded overflow-hidden shadow-lg bg-gray-900 text-white ${className}`}
    >
      <TableHeader columns={columns} />
      <div className="table-body">
        {data.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            columns={columns}
            correctRow={correctData}
            colorMapping={colorMapping}
            onClick={onRowClick ? () => onRowClick(row) : undefined} // Transmettre l'événement de clic
          />
        ))}
      </div>
    </div>
  );
}

export default GameTable;
