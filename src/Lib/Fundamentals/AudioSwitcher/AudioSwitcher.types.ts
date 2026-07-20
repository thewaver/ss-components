import type { AccessorProps } from "../../Utils/typeUtils";

export type AudioSwitcherController = {
    play: () => boolean;
    pause: () => boolean;
    reset: () => boolean;
};

export type AudioSwitcherProps = AccessorProps<{
    src: string;
    crossfadeMs?: number;
    volume?: number;
    getController?: (controller: AudioSwitcherController) => void;
}>;
