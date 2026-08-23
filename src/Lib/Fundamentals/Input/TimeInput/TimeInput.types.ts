import type { JSX, Signal } from "solid-js";

import type { TimeValue, TimeValueMeridiem } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldFlags, TextFieldProps } from "../TextField/TextField.types";

export type TimeInputMeridiem = {
    getValue: () => TimeValueMeridiem;
    set: (meridiem: TimeValueMeridiem) => void;
    toggle: () => void;
};

export type TimeInputProps = Omit<
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
    | "min"
    | "max"
    | "step"
    | "renderTrailing"
    | "onInput"
    | "onBlur"
    | "onKeyDown"
> &
    AccessorProps<{
        minTime?: TimeValue;
        maxTime?: TimeValue;
        hasSeconds?: boolean;
        isTwelveHour?: boolean;
    }> & {
        valueSignal: Signal<TimeValue | undefined>;
        renderTrailing?: (getFlags: () => InteractionFlags<TextFieldFlags>, meridiem: TimeInputMeridiem) => JSX.Element;
    };
