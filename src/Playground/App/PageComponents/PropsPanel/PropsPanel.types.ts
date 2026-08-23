import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PagePropsPanelScope = "global" | "local";

export type PagePropsPanelProps = AccessorProps<{
    scope: PagePropsPanelScope;
}>;
