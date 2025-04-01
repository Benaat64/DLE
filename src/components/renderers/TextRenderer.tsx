import { RendererProps } from "../GameTable/types";

function TextRenderer({ value }: RendererProps) {
  return <span className="text-white">{value}</span>;
}

export default TextRenderer;
