import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldProps } from "../TextField/TextField.types";

export type AmountInputProps = Omit<
    TextFieldProps,
    | "valueSignal"
    | "getElement"
    | "getType"
    | "getInputMode"
    | "computeMaskedText"
    | "getPlaceholderHint"
    | "getIsSpinButton"
    | "getIsAutoSizing"
    | "getMinRows"
    | "getMaxRows"
    | "getStep"
    | "onInput"
    | "onBlur"
> &
    AccessorProps<{
        decimals?: number;
        groupSize?: number;
        locale?: string;
    }> & {
        valueSignal: Signal<number | undefined>;
    };
