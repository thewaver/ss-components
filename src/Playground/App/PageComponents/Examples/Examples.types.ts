import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ExampleDefs = {
    name: string;
    src: string;
    readout?: () => string;
    component: () => JSX.Element;
};

export type ExamplesProps = AccessorProps<{
    items: ExampleDefs[];
}>;
