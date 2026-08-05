import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../Utils/typeUtils";

export type LabelDir = "column" | "row";

export type LabelProps = ParentProps<
    AccessorProps<{
        dir?: LabelDir;
        gap?: number;
    }>
>;
