import { Column, ColorMapping, GameData } from "./types";
import { rendererMap } from "../renderers";

interface TableCellProps {
  column: Column;
  value: any;
  item?: GameData; // S'assurer que cette prop est définie
  correctValue?: any;
  isCorrect?: boolean;
  colorMapping?: ColorMapping;
  allPlayers?: GameData[];
}

function TableCell({
  column,
  value,
  item, // Utiliser cette prop
  correctValue,
  isCorrect,
  colorMapping,
  allPlayers,
}: TableCellProps) {
  // Log pour voir si item est correctement passé
  console.log(`TableCell - Column: ${column.id}, Value: ${value}, Item:`, item);

  const Renderer = rendererMap[column.renderer] || rendererMap.text;

  // Déterminer la classe de couleur
  let colorClass = "";
  if (colorMapping && correctValue !== undefined) {
    // Utiliser la fonction compare du colorMapping
    colorClass = colorMapping.compare(
      value,
      correctValue,
      column.id,
      allPlayers
    );
  }

  return (
    <div
      className={`p-2 ${
        column.align === "right"
          ? "text-right"
          : column.align === "center"
          ? "text-center"
          : "text-left"
      } ${colorClass} text-cell-white`}
    >
      <Renderer
        value={value}
        countryCode={item?.countryCode} // Passer la prop countryCode
        correctValue={correctValue}
        isCorrect={isCorrect}
      />
    </div>
  );
}

export default TableCell;
