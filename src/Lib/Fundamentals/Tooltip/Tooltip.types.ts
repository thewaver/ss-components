import type { JSX } from "solid-js";

import { Point2d, Size2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type TooltipProps = AccessorProps<{
    placement: AnchorPlacement;
    offset?: Point2d;
    reservedScreenSize?: Size2d;
    transitionDurationMs?: number;
    focusShowDelayMs?: number;
    anchorRef: HTMLElement | undefined;
    renderContent: (
        getVisibilityTarget: () => 0 | 1,
        getTransitionDurationMs: () => number,
        getPlacement: () => AnchorPlacement,
    ) => JSX.Element;
}>;
