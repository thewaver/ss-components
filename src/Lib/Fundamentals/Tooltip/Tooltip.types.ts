import { JSX } from "solid-js";

import { Point2d, Size2d } from "@thewaver/ss-utils";

import { AccessorProps } from "../../Utils/typeUtils";

export type TooltipHPlacement = "left-in" | "left-out" | "right-in" | "right-out" | "center";

export type TooltipVPlacement = "top-in" | "top-out" | "bottom-in" | "bottom-out" | "center";

export type TooltipProps = AccessorProps<{
    anchorRef: HTMLDivElement | undefined;
    hPlacement: TooltipHPlacement;
    vPlacement: TooltipVPlacement;
    offset?: Point2d;
    reservedScreenSize?: Size2d;
    transitionDurationMs?: number;
    focusShowDelayMs?: number;
    renderContent: (isVisible: boolean, hPlacement: TooltipHPlacement, vPlacement: TooltipVPlacement) => JSX.Element;
}>;
