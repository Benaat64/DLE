// Type pour le dictionnaire des pays
interface CountryCodes {
  [country: string]: string;
}

// Dictionnaire des pays et leurs codes ISO 2
const countryCodes: CountryCodes = {
  "South Korea": "kr",
  Korea: "kr",
  China: "cn",
  "United States": "us",
  USA: "us",
  France: "fr",
  Germany: "de",
  "United Kingdom": "gb",
  UK: "gb",
  Spain: "es",
  Italy: "it",
  Japan: "jp",
  Canada: "ca",
  Brazil: "br",
  Denmark: "dk",
  Sweden: "se",
  Norway: "no",
  Finland: "fi",
  Belgium: "be",
  Netherlands: "nl",
  Poland: "pl",
  Australia: "au",
  Russia: "ru",
  Turkey: "tr",
  Vietnam: "vn",
  Taiwan: "tw",
  Indonesia: "id",
  Malaysia: "my",
  Thailand: "th",
  Philippines: "ph",
  Singapore: "sg",
  Mexico: "mx",
  Argentina: "ar",
  Chile: "cl",
  Peru: "pe",
  Colombia: "co",
  Venezuela: "ve",
  Croatia: "hr",
  "Czech Republic": "cz",
  Czechia: "cz",
  Greece: "gr",
  Hungary: "hu",
  Iceland: "is",
  Ireland: "ie",
  Portugal: "pt",
  Romania: "ro",
  Slovakia: "sk",
  Slovenia: "si",
  Switzerland: "ch",
  Bulgaria: "bg",
  Estonia: "ee",
  Latvia: "lv",
  Lithuania: "lt",
  Luxembourg: "lu",
  Malta: "mt",
  "New Zealand": "nz",
  Serbia: "rs",
  Ukraine: "ua",
  Albania: "al",
  Austria: "at",
  Cyprus: "cy",
  "Hong Kong": "hk",
};

/**
 * Convertit un nom de pays en code de pays (ISO 2)
 * @param country - Le nom du pays à convertir
 * @returns Le code ISO 2 du pays, ou null si non trouvé
 */
export const getCountryCode = (
  country: string | null | undefined
): string | null => {
  if (!country) return null;
  const cleanCountry = country.trim();
  return countryCodes[cleanCountry] || null;
};

/**
 * Génère l'URL d'une image de drapeau
 * @param countryCode - Le code ISO 2 du pays
 * @param width - La largeur souhaitée de l'image (par défaut: 40px)
 * @returns L'URL de l'image du drapeau, ou null si pas de code pays
 */
export const getFlagImageUrl = (
  countryCode: string | null | undefined,
  width = 40
): string | null => {
  if (!countryCode) return null;
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
};

/**
 * Convertit un code de pays en emoji de drapeau
 * @param countryCode - Le code ISO 2 du pays
 * @returns L'emoji du drapeau du pays, ou un drapeau blanc si pas de code pays
 */
export const getFlagEmoji = (
  countryCode: string | null | undefined
): string => {
  if (!countryCode) return "🏳️";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
