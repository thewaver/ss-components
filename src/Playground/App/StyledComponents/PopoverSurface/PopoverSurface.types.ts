import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type PopoverSurfaceProps = AccessorProps<{
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
    placement: AnchorPlacement;
}>;
