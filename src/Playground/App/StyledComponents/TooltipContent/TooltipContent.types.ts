import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type TooltipContentProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
}>;
