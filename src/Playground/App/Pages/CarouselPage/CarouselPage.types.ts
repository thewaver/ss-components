import type { Accessor, Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CarouselExampleProps = AccessorProps<{
    slides: string[];
    isDisabled: boolean;
    indexSignal: Signal<number>;
}> & {
    getAutoplayDelayMs?: Accessor<number>;
    playingSignal?: Signal<boolean>;
};
