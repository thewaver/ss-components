import { Spotlight } from "../Spotlight/Spotlight";
import type { SpotlightHintProps } from "../Spotlight/Spotlight.types";

/**
 * A spotlight that only points. The overlay swallows a click and uses it to dismiss, any key that is not a
 * bare modifier dismisses too, and the highlighted element stays live throughout — so a keyboard user who
 * presses anything simply carries on with the hint gone.
 */
export const SpotlightHint = (props: SpotlightHintProps) => <Spotlight {...props} getMode={() => "hint"} />;
