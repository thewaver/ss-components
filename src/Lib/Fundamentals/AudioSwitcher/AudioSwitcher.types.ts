import type { Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type AudioSwitcherController = {
    reset: () => boolean;
};

export type AudioSwitcherProps = AccessorProps<{
    src: string;
    crossfadeMs?: number;
    volume?: number;
    playbackSignal?: Signal<boolean>;
    onMount?: (controller: AudioSwitcherController) => void;
}>;
