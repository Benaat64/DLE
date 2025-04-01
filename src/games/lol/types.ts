// types.ts - Mise à jour pour inclure les nouveaux champs
export interface LolPlayerData {
  id: string;
  name: string;
  team: string;
  league: string;
  role: string;
  image?: string;
  country: string;
  countryCode?: string; // Ajout du champ countryCode
  nationalityPrimary?: string;
  age: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    twitch?: string;
    tiktok?: string;
    discord?: string;
  };
  signatureChampions?: string[];
}
