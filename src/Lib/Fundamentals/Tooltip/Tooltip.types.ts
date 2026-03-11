import { JSX } from "solid-js";

import { Point2d, Size2d } from "@thewaver/ss-utils";

import { AccessorProps } from "../../Utils/typeUtils";

export type TooltipHPlacement = "left-in" | "left-out" | "right-in" | "right-out" | "center";

export type TooltipVPlacement = "top-in" | "top-out" | "bottom-in" | "bottom-out" | "center";

export type TooltipPlacement = {
    x: TooltipHPlacement;
    y: TooltipVPlacement;
};

export type TooltipProps = AccessorProps<{
    anchorRef: HTMLDivElement | undefined;
    placement: TooltipPlacement;
    offset?: Point2d;
    reservedScreenSize?: Size2d;
    transitionDurationMs?: number;
    focusShowDelayMs?: number;
    renderContent: (getVisibilityTarget: () => 0 | 1, getPlacement: () => TooltipPlacement) => JSX.Element;
}>;
