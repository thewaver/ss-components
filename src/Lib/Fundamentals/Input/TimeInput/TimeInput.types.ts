import type { Signal } from "solid-js";

import type { TimeValue } from "../../../Abstracts/TimeValue/TimeValue.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldProps } from "../TextField/TextField.types";

export type TimeInputProps = Omit<
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
    | "onKeyDown"
> &
    AccessorProps<{
        minTime?: TimeValue;
        maxTime?: TimeValue;
        hasSeconds?: boolean;
    }> & {
        valueSignal: Signal<TimeValue | undefined>;
    };
