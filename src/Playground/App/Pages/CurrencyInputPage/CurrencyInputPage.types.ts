import type { Signal } from "solid-js";

import type { AccessorProps, MaybeAccessor } from "../../../../Lib/Utils/typeUtils";

export type CurrencyInputExampleProps = AccessorProps<{
    locale: string;
    decimals: number;
    hasSign: boolean;
}> & {
    groupSizes: MaybeAccessor<number[] | undefined>;
    valueSignal: Signal<number | undefined>;
};
