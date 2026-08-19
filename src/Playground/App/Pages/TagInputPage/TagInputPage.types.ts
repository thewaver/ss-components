import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TagInputExampleProps = AccessorProps<{
    isDisabled: boolean;
    hasError: boolean;
}> & {
    valueSignal: Signal<string[]>;
};
