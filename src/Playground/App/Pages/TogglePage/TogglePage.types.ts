import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ToggleExampleProps = {
    checkedSignal: Signal<boolean>;
};

export type ToggleMixedExampleProps = AccessorProps<{
    allSignal: Signal<boolean>;
    firstChildSignal: Signal<boolean>;
    secondChildSignal: Signal<boolean>;
    isMixed: boolean;
}>;
