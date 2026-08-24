import type { JSX, Signal } from "solid-js";

import type { TimeValue } from "@thewaver/ss-utils";

import type { DateTimeValue } from "../../../Abstracts/DateTimeValue/DateTimeValue.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { ClockColumnRenderer, ClockOptionRenderer, ClockSteps, ClockUnitRenderer } from "../Clock/Clock.types";
import type { DatePickerProps } from "../DatePicker/DatePicker.types";
import type { TimePickerProps } from "../TimePicker/TimePicker.types";

export type DateTimePickerProps = Omit<DatePickerProps, "valueSignal" | "ariaLabel" | "visibilitySignal"> &
    AccessorProps<{
        dateLabel?: string;
        timeLabel?: string;
        clockLabel?: string;
        minTime?: TimeValue;
        maxTime?: TimeValue;
        hasSeconds?: boolean;
        isTwelveHour?: boolean;
        clockSteps?: ClockSteps;
        clockGap?: number;
        computeIsTimeDisabled?: (time: TimeValue) => boolean;
    }> & {
        valueSignal: Signal<DateTimeValue | undefined>;
        dateVisibilitySignal?: Signal<boolean>;
        timeVisibilitySignal?: Signal<boolean>;
        renderSeparator?: () => JSX.Element;
        renderTimeTrailing: TimePickerProps["renderTrailing"];
        renderOption: ClockOptionRenderer;
        renderUnit?: ClockUnitRenderer;
        renderColumn?: ClockColumnRenderer;
        renderTimePopup: TimePickerProps["renderPopup"];
    };
