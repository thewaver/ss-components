import { Spotlight } from "../Spotlight/Spotlight";
import type { SpotlightGuideProps } from "../Spotlight/Spotlight.types";

/**
 * A spotlight that explains. The page is sealed with `inert`, so the highlighted element is shown rather than
 * offered, and the only live thing is the popup the consumer paints beside it — which is why `renderPopup` is
 * required here and absent from the other two.
 */
export const SpotlightGuide = (props: SpotlightGuideProps) => <Spotlight {...props} getMode={() => "guide"} />;
