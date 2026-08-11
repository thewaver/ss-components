import type { Signal } from "solid-js";

import type { DateValue } from "../../../../Lib/Abstracts/DateValue/DateValue.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageCalendarCaptionProps = {
    monthSignal: Signal<DateValue>;
} & AccessorProps<{
    locale?: string;
}>;
