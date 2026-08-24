import type { Signal } from "solid-js";

import type { DateValueCalendarId, DateValueRange } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DateRangeExampleProps = AccessorProps<{
    calendar: DateValueCalendarId;
}> & {
    valueSignal: Signal<DateValueRange | undefined>;
};
