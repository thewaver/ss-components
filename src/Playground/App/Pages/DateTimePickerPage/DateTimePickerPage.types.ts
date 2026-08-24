import type { Signal } from "solid-js";

import type { DateTimeValue } from "../../../../Lib/Abstracts/DateTimeValue/DateTimeValue.types";

export type DateTimeExampleProps = {
    valueSignal: Signal<DateTimeValue | undefined>;
};
