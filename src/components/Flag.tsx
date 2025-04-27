// components/Flag.tsx
import * as flags from "country-flag-icons/react/3x2";
import { getCountryCode } from "../utils/countriesUtil";

interface FlagProps {
  country?: string;
  countryCode?: string;
  className?: string;
  title?: string;
}

const Flag = ({
  country,
  countryCode,
  className = "h-4 w-auto inline-block",
  title,
}: FlagProps) => {
  // Utiliser countryCode s'il est fourni, sinon le dériver du pays
  const code = countryCode || getCountryCode(country || "");

  if (!code) return null;

  try {
    const countryCodeUpper = code.toUpperCase();
    const FlagComponent = flags[countryCodeUpper as keyof typeof flags];

    if (FlagComponent) {
      return <FlagComponent className={className} title={title || country} />;
    }
  } catch (e) {
    console.error("Erreur avec le drapeau:", e);
  }

  // Fallback si pas de drapeau trouvé
  return <span>({code.toUpperCase()})</span>;
};

export default Flag;
