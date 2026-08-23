import { Spotlight } from "../Spotlight/Spotlight";
import type { SpotlightPromptProps } from "../Spotlight/Spotlight.types";

export const SpotlightPrompt = (props: SpotlightPromptProps) => <Spotlight {...props} mode={"prompt"} />;
