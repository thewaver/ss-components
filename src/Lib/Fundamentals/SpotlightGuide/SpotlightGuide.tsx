import { Spotlight } from "../Spotlight/Spotlight";
import type { SpotlightGuideProps } from "../Spotlight/Spotlight.types";

export const SpotlightGuide = (props: SpotlightGuideProps) => <Spotlight {...props} getMode={() => "guide"} />;
