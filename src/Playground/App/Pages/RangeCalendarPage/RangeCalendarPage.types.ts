import type { Signal } from "solid-js";

import type {
    DateValue,
    DateValueRange,
    DateValueWeekStart,
} from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type RangeCalendarExampleProps = AccessorProps<{
    weekStartsOn: DateValueWeekStart;
}> & {
    valueSignal: Signal<DateValueRange | undefined>;
    monthSignal: Signal<DateValue>;
};
