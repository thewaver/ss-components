import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ExampleDefs = {
    key: string;
    name: string;
    span?: number;
    path?: string;
    sampleKeys?: () => string[];
    readout?: () => string;
    component: () => JSX.Element;
};

export type ExamplesProps = AccessorProps<{
    items: ExampleDefs[];
    minColumnWidth?: number;
}>;
