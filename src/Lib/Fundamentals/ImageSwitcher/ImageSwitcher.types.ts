import { AccessorProps } from "../../Utils/typeUtils";

export type ImageSwitcherProps = AccessorProps<{
    src: string | undefined;
    transitionDurationMs?: number;
    onLoad?: GlobalEventHandlers["onload"];
}>;
