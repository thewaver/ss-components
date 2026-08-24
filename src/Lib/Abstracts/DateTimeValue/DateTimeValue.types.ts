import type { TimeValue } from "@thewaver/ss-utils";

import type { DateValue } from "../DateValue/DateValue.types";

export type DateTimeValue = {
    date: DateValue;
    time: TimeValue;
};
