import type { ParentProps } from "solid-js";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PagePropsPanelScope = "global" | "local";

export type PagePropsPanelProps = ParentProps<
    AccessorProps<{
        scope: PagePropsPanelScope;
    }>
>;
