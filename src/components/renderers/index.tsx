import TextRenderer from "./TextRenderer";
import FlagRenderer from "./FlagRenderer";

export const rendererMap = {
  text: TextRenderer,
  flag: FlagRenderer,
  // Les autres renderers seront ajoutés ici
};

export { TextRenderer, FlagRenderer };
