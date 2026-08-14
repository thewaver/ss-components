import { Spotlight } from "../Spotlight/Spotlight";
import type { SpotlightPromptProps } from "../Spotlight/Spotlight.types";

/**
 * A spotlight that insists. Nothing outside the highlighted element can be clicked or focused, and focus is
 * pulled back to it whenever it wanders. `Escape` still closes it, which WCAG 2.1.2 requires and which makes
 * the honest description of this preset "click it, or press Escape".
 */
export const SpotlightPrompt = (props: SpotlightPromptProps) => <Spotlight {...props} getMode={() => "prompt"} />;
