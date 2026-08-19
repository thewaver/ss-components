import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type VariantDefs = {
    key: string;
    name: string;
    readout?: () => string;
    component: () => JSX.Element;
};

export type VariantsProps = AccessorProps<{
    items: VariantDefs[];
}>;
