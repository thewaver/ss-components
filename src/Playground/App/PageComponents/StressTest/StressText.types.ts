import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type StressTestDefs = {
    count: number;
    cols: number;
    gap: number;
    anchorHue: number;
};

export type StressTestProps = AccessorProps<{
    configs: StressTestDefs[];
    renderItem: (getConfigIndex: () => number, getItemIndex: () => number) => JSX.Element;
}>;
