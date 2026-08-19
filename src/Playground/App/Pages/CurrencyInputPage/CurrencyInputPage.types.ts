import type { Signal } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type CurrencyInputExampleProps = AccessorProps<{
    locale: string;
    decimals: number;
    groupSize: number;
}> & {
    valueSignal: Signal<number | undefined>;
};
