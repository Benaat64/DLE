import { Column, ColorMapping, GameData } from "./types";
import { rendererMap } from "../renderers";

interface TableCellProps {
  column: Column;
  value: any;
  item?: GameData;
  correctValue?: any;
  isCorrect?: boolean;
  colorMapping?: ColorMapping;
  allPlayers?: GameData[];
}

function TableCell({
  column,
  value,
  item,
  correctValue,
  isCorrect,
  colorMapping,
}: TableCellProps) {
  // Correction 1: Ajout d'une vérification de type sûre
  const rendererKey = column.renderer as keyof typeof rendererMap;
  const Renderer = rendererMap[rendererKey] || rendererMap.text;

  // Déterminer la classe de couleur
  let colorClass = "";
  if (colorMapping && correctValue !== undefined) {
    // Correction 2: Suppression du paramètre allPlayers
    colorClass = colorMapping.compare(
      value,
      correctValue,
      column.id
      // Retirer allPlayers ici
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
        countryCode={item?.countryCode}
        correctValue={correctValue}
        isCorrect={isCorrect}
      />
    </div>
  );
}

export default TableCell;
