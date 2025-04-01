// Base type pour toutes les données de jeu
export interface GameData {
  id: string;
  name: string;
  [key: string]: any; // Propriétés additionnelles selon le jeu
}

// Interface pour la colonne du tableau
export interface Column {
  id: string;
  title: string;
  renderer: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

// Interface pour le mapping des couleurs
export interface ColorMapping {
  exact: string;
  similar: string;
  none: string;
  compare: (
    value: any,
    correctValue: any,
    columnId: string,
    allPlayers?: GameData[]
  ) => string;
}

// Interface pour l'adaptateur de données
export interface DataAdapter<T extends GameData> {
  fetchPlayers: () => Promise<T[]>;
  getTestPlayers: () => Promise<T[]>;
}

// Interface pour la configuration du thème
export interface ThemeConfig<T extends GameData> {
  gameName: string;
  gameDescription: string;
  columns: Column[];
  colorMapping: ColorMapping;
  maxAttempts: number;
  enrichPlayerDetails?: (player: T) => Promise<T>;
}

// Interface pour la stratégie de sélection des joueurs
export interface PlayerSelectionStrategy<T extends GameData> {
  selectPlayer: (players: T[]) => T | null;
}

// Configuration complète du jeu
export interface GameConfig<T extends GameData> {
  adapter: DataAdapter<T>;
  themeConfig: ThemeConfig<T>;
  selectionStrategy: PlayerSelectionStrategy<T>;
}
