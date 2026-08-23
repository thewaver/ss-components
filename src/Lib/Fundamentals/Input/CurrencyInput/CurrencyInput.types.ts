import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldProps } from "../TextField/TextField.types";

export type CurrencyInputProps = Omit<
    TextFieldProps,
    | "valueSignal"
    | "element"
    | "type"
    | "inputMode"
    | "computeMaskedText"
    | "placeholderHint"
    | "isSpinButton"
    | "isAutoSizing"
    | "minRows"
    | "maxRows"
    | "step"
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
