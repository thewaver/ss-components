import { ImageSwitcher } from "../../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher";
import type { ImageSwitcherProps } from "../../../../../Lib/Fundamentals/ImageSwitcher/ImageSwitcher.types";

export const DefaultExample = (props: ImageSwitcherProps) => {
    return <ImageSwitcher src={props.src} transitionDurationMs={props.transitionDurationMs} onLoad={props.onLoad} />;
};
