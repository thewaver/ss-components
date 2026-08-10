import type { Signal } from "solid-js";

import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldProps } from "../TextField/TextField.types";

export type DateInputProps = Omit<
    TextFieldProps,
    | "valueSignal"
    | "getElement"
    | "getType"
    | "getInputMode"
    | "getIsSpinButton"
    | "getIsAutoSizing"
    | "getMinRows"
    | "getMaxRows"
    | "getMin"
    | "getMax"
    | "getStep"
    | "onInput"
    | "onBlur"
> &
    AccessorProps<{
        minDate?: DateValue;
        maxDate?: DateValue;
    }> & {
        valueSignal: Signal<DateValue | undefined>;
    };
