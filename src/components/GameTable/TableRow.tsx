import { Column, GameData, ColorMapping } from "./types";
import TableCell from "./TableCell";

interface TableRowProps {
  row: GameData;
  columns: Column[];
  correctRow?: GameData;
  colorMapping?: ColorMapping;
  onClick?: () => void;
}

function TableRow({
  row,
  columns,
  correctRow,
  colorMapping,
  onClick,
}: TableRowProps) {
  // Log pour vérifier la structure des données

  return (
    <div
      className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
      onClick={onClick}
    >
      {columns.map((column) => {
        const value = row[column.id]; // Accès direct aux propriétés
        const correctValue = correctRow ? correctRow[column.id] : undefined;
        const isCorrect = correctRow ? value === correctValue : undefined;

        return (
          <TableCell
            key={column.id}
            column={column}
            value={value}
            item={row} // Cette ligne est cruciale - assurez-vous qu'elle est présente
            correctValue={correctValue}
            isCorrect={isCorrect}
            colorMapping={colorMapping}
          />
        );
      })}
    </div>
  );
}

export default TableRow;
