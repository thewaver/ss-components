import type { JSX, Signal } from "solid-js";

import type { Point2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../../Abstracts/Anchor/Anchor.types";
import type { DateValue, DateValueWeekStart } from "../../../Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { CalendarDayRenderer, CalendarWeekdayRenderer } from "../Calendar/Calendar.types";
import type { DateInputProps } from "../DateInput/DateInput.types";

export type DatePickerProps = Omit<DateInputProps, "renderTrailing"> &
    AccessorProps<{
        placement?: AnchorPlacement;
        offset?: Point2d;
        popupTransitionDurationMs?: number;
        calendarLabel?: string;
        locale?: string;
        weekStartsOn?: DateValueWeekStart;
        computeIsDayDisabled?: (day: DateValue) => boolean;
    }> & {
        visibilitySignal?: Signal<boolean>;
        renderTrigger: (getIsOpen: () => boolean, onToggle: () => void) => JSX.Element;
        renderDay: CalendarDayRenderer;
        renderWeekday?: CalendarWeekdayRenderer;
        renderPopup: (
            renderCalendar: () => JSX.Element,
            monthSignal: Signal<DateValue>,
            getVisibilityTarget: () => 0 | 1,
            getTransitionDurationMs: () => number,
        ) => JSX.Element;
    };
