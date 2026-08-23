import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CarouselExampleProps = AccessorProps<{
    slides: string[];
    isDisabled: boolean;
    autoplayDelayMs?: number;
    indexSignal: Signal<number>;
    playingSignal?: Signal<boolean>;
}>;
