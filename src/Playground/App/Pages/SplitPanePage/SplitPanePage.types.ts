import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type SplitPaneExampleProps = AccessorProps<{
    gutterSize: number;
    isDisabled: boolean;
}> & {
    ratiosSignal: Signal<number[]>;
};
