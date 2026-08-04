import type { Accessor } from "solid-js";

export type ColorExtractorContextType = {
    getSrc: Accessor<string>;
    getColorCount?: Accessor<number>;
    getSamplePercentile?: Accessor<number>;
};
