import type { JSX, Signal } from "solid-js";

import type { TimeValue, TimeValueMeridiem } from "@thewaver/ss-utils";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { TextFieldFlags, TextFieldProps } from "../TextField/TextField.types";

/**
 * The half of the day, handed to the painter so it can draw whatever control it likes for it — the actions
 * stay out of the flags, exactly as `NumberInputStepper` does. `set` and `toggle` both move the value when
 * there is one, so a painter never converts an hour itself.
 */
export type TimeInputMeridiem = {
    getValue: () => TimeValueMeridiem;
    set: (meridiem: TimeValueMeridiem) => void;
    toggle: () => void;
};

export type TimeInputProps = Omit<
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
    | "getMin"
    | "getMax"
    | "getStep"
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
