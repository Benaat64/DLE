// components/GameTable/GameTable.tsx
import React from "react";
import { View, ScrollView } from "react-native";
import tw from "twrnc";

import { Column, GameData, ColorMapping } from "./types";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface GameTableProps {
  columns: Column[];
  data: GameData[];
  correctData?: GameData;
  colorMapping?: ColorMapping;
  allPlayers?: GameData[];
  onRowClick?: (player: GameData) => void;
}

const GameTable = ({
  columns,
  data,
  correctData,
  colorMapping,

  onRowClick,
}: GameTableProps) => {
  return (
    <View style={tw`rounded-lg overflow-hidden shadow-lg bg-gray-900`}>
      <TableHeader columns={columns} />
      <ScrollView>
        {data.map((row) => (
          <TableRow
            key={row.id}
            row={row}
            columns={columns}
            correctRow={correctData}
            colorMapping={colorMapping}
            onPress={onRowClick ? () => onRowClick(row) : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default GameTable;
