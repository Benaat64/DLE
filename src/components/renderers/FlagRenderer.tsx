import { RendererProps } from "../GameTable/types";
import Flag from "../Flag";

function FlagRenderer({ value, countryCode }: RendererProps) {
  return <Flag country={value} countryCode={countryCode} />;
}

export default FlagRenderer;
