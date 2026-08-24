import { createSignal } from "solid-js";

import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { CalendarComposite } from "../Calendar/Calendar";
import type { RangeCalendarProps } from "../Calendar/Calendar.types";

export const RangeCalendar = (props: RangeCalendarProps) => {
    const [getPendingStart, setPendingStart] = createSignal<DateValue | undefined>();

    const getRange = () => props.valueSignal[0]();

    const pick = (day: DateValue) => {
        const pending = getPendingStart();

        if (!pending) {
            setPendingStart(() => day);
            props.valueSignal[1](() => undefined);

            return;
        }

        setPendingStart(() => undefined);
        props.valueSignal[1](() => DateValueUtils.orderRange(pending, day));
    };

    return (
        <CalendarComposite
            {...props}
            computeIsSelected={(day) => {
                const pending = getPendingStart();

                if (pending) return DateValueUtils.isSame(day, pending);

                const range = getRange();

                return DateValueUtils.isSame(day, range?.start) || DateValueUtils.isSame(day, range?.end);
            }}
            computeAnchorDay={() => getPendingStart() ?? getRange()?.start}
            computeRange={(highlighted) => {
                const pending = getPendingStart();

                return pending ? DateValueUtils.orderRange(pending, highlighted) : getRange();
            }}
            onPick={pick}
        />
    );
};
