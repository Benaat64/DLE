import { RendererProps } from "../GameTable/types";
import { getCountryCode } from "../../utils/countriesUtil";
// Import correct des drapeaux
import * as flags from "country-flag-icons/react/3x2";

function FlagRenderer({ value, countryCode }: RendererProps) {
  // Si le countryCode est fourni, l'utiliser; sinon essayer de le dériver du nom du pays
  const code = countryCode || getCountryCode(value);

  if (code) {
    try {
      // Obtenez le composant de drapeau dynamiquement
      const countryCodeUpper = code.toUpperCase();
      const FlagComponent = flags[countryCodeUpper as keyof typeof flags];

      if (FlagComponent) {
        return (
          <FlagComponent className="h-4 w-auto inline-block" title={value} />
        );
      } else {
        console.warn(
          `Pas de composant de drapeau pour le code: ${countryCodeUpper}`
        );
        return <span className="text-white">({countryCodeUpper})</span>;
      }
    } catch (e) {
      console.error("Erreur avec le drapeau:", e);
      return <span className="text-white">({code.toUpperCase()})</span>;
    }
  }

  return <span className="text-white">{value}</span>;
}

export default FlagRenderer;
