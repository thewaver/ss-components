import type { Signal } from "solid-js";

import type { RangeValues } from "../../../../Lib/Fundamentals/Input/Range/Range.types";

export type RangeExampleProps = {
    valueSignal: Signal<number>;
};

export type RangePairExampleProps = {
    rangeSignal: Signal<RangeValues>;
};

export type RangeVerticalExampleProps = RangeExampleProps & RangePairExampleProps;
