import type { Accessor, JSX, Signal } from "solid-js";

import type {
    DateValue,
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

export type CalendarProps = AccessorProps<{
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
    valueSignal: Signal<DateValue | undefined>;
    monthSignal: Signal<DateValue>;
    renderDay: CalendarDayRenderer;
    renderWeekday?: CalendarWeekdayRenderer;
};
