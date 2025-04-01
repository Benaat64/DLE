export type RendererType =
  | "text"
  | "flag"
  | "team"
  | "number"
  | "role"
  | "indicator"
  | "image";

export interface Column {
  id: string;
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
  countryCode?: string; // Assurez-vous que cette propriété existe
  age: string;
}
