export type RendererType =
  | "text"
  | "flag"
  | "team"
  | "number"
  | "role"
  | "indicator"
  | "image";

export type ColumnId = keyof GameData;

export interface Column {
  id: ColumnId;
  title: string;
  renderer: RendererType;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}
export interface GameData {
  id: string;
  name: string;
  team: string;
  league: string;
  role: string;
  image: string;
  country: string;
  age: string;
}

export interface ColorMapping {
  exact: string;
  similar: string;
  none: string;
  compare: (value: any, correctValue: any, columnId: string) => string;
}

export interface RendererProps {
  value: any;
  correctValue?: any;
  isCorrect?: boolean;
  countryCode?: string;
}
export interface GameData {
  id: string;
  name: string;
  team: string;
  league: string;
  role: string;
  image: string;
  country: string;
  countryCode?: string;
  age: string;
}
