import type { Signal } from "solid-js";

import type { TimeValue } from "@thewaver/ss-utils";

import type { DateValue, DateValueCalendarId } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type DateExampleProps = AccessorProps<{
    calendar: DateValueCalendarId;
}> & {
    valueSignal: Signal<DateValue | undefined>;
};

export type TimeExampleProps = {
    valueSignal: Signal<TimeValue | undefined>;
};
