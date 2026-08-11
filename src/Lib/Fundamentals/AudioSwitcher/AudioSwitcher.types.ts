import type { Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

/**
 * Rewinding is a command, not a state, so it stays a handle handed over at mount while play and pause moved to
 * `playbackSignal`. `Typewriter`'s restart is the same shape for the same reason — see `conventions.md`.
 */
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
