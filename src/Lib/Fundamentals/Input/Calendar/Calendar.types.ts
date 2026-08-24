import type { Accessor, JSX, Signal } from "solid-js";

import type {
    DateValue,
    DateValueRange,
    DateValueWeekStart,
    DateValueWeekdayWidth,
} from "../../../Abstracts/DateValue/DateValue.types";
import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../../Utils/typeUtils";
import type { InteractionControlProps } from "../../InteractionWrapper/InteractionWrapper.types";

export type CalendarFlags = {
    day: DateValue;
    isSelected: boolean;
    isToday: boolean;
    isOutsideMonth: boolean;
    isHighlighted: boolean;
    isInRange: boolean;
    isRangeStart: boolean;
    isRangeEnd: boolean;
};

export type CalendarDayRenderer = (
    getDay: Accessor<DateValue>,
    getFlags: () => InteractionFlags<CalendarFlags>,
) => JSX.Element;

export type CalendarWeekdayRenderer = (name: string, index: number) => JSX.Element;

export type CalendarDayProps = AccessorProps<
    Omit<InteractionControlProps<CalendarFlags>, "renderContent"> & {
        ariaLabel: string;
    }
> & {
    renderContent: (getFlags: () => InteractionFlags<CalendarFlags>) => JSX.Element;
    onSelect: () => void;
};

export type CalendarBaseProps = AccessorProps<{
    ariaLabel?: string;
    locale?: string;
    weekStartsOn?: DateValueWeekStart;
    weekdayWidth?: DateValueWeekdayWidth;
    today?: DateValue;
    min?: DateValue;
    max?: DateValue;
    isDisabled?: boolean;
    gap?: number;
    computeIsDayDisabled?: (day: DateValue) => boolean;
}> & {
    monthSignal: Signal<DateValue>;
    renderDay: CalendarDayRenderer;
    renderWeekday?: CalendarWeekdayRenderer;
};

export type CalendarCompositeProps = CalendarBaseProps & {
    computeIsSelected: (day: DateValue) => boolean;
    computeAnchorDay?: () => DateValue | undefined;
    computeRange?: (highlighted: DateValue) => DateValueRange | undefined;
    onPick: (day: DateValue) => void;
};

export type CalendarProps = CalendarBaseProps & {
    valueSignal: Signal<DateValue | undefined>;
};

export type RangeCalendarProps = CalendarBaseProps & {
    valueSignal: Signal<DateValueRange | undefined>;
};
