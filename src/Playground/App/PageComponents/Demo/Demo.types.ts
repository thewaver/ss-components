import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageDemoProps = ParentProps<
    AccessorProps<{
        name: string;
        readout?: string;
    }>
>;
