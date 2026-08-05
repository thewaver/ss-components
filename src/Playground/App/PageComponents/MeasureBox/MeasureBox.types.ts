import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PageMeasureBoxProps = ParentProps<
    AccessorProps<{
        width?: number;
        height?: number;
    }>
>;
