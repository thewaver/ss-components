import { ImageSwitcher } from "../../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher";
import type { ImageSwitcherProps } from "../../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher.types";

export const DefaultExample = (props: ImageSwitcherProps) => {
    return <ImageSwitcher getSrc={props.getSrc} getTransitionDurationMs={props.getTransitionDurationMs} />;
};
