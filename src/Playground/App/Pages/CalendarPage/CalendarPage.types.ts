import type { Signal } from "solid-js";

import type { DateValue, DateValueWeekStart } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CalendarExampleProps = AccessorProps<{
    weekStartsOn: DateValueWeekStart;
}> & {
    valueSignal: Signal<DateValue | undefined>;
    monthSignal: Signal<DateValue>;
};
