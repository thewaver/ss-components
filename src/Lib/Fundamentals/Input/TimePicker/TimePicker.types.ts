import type { JSX, Signal } from "solid-js";

import type { Point2d, TimeValue } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { ClockColumnRenderer, ClockOptionRenderer, ClockSteps, ClockUnitRenderer } from "../Clock/Clock.types";
import type { TextFieldFlags } from "../TextField/TextField.types";
import type { TimeInputMeridiem, TimeInputProps } from "../TimeInput/TimeInput.types";

export type TimePickerTrigger = {
    getIsOpen: () => boolean;
    toggle: () => void;
};

export type TimePickerProps = Omit<TimeInputProps, "renderTrailing"> &
    AccessorProps<{
        placement?: AnchorPlacement;
        offset?: Point2d;
        popupTransitionDurationMs?: number;
        clockLabel?: string;
        locale?: string;
        clockSteps?: ClockSteps;
        clockGap?: number;
        computeIsTimeDisabled?: (time: TimeValue) => boolean;
    }> & {
        visibilitySignal?: Signal<boolean>;
        renderTrailing: (
            getFlags: () => InteractionFlags<TextFieldFlags>,
            meridiem: TimeInputMeridiem,
            trigger: TimePickerTrigger,
        ) => JSX.Element;
        renderOption: ClockOptionRenderer;
        renderUnit?: ClockUnitRenderer;
        renderColumn?: ClockColumnRenderer;
        renderPopup: (
            renderClock: () => JSX.Element,
            getVisibilityTarget: () => 0 | 1,
            getTransitionDurationMs: () => number,
        ) => JSX.Element;
    };
