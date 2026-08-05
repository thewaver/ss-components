import type { JSX } from "solid-js";

import type { ExternalInteractionFlags, InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { TooltipPlacement, TooltipProps } from "../Tooltip/Tooltip.types";

export type InteractionSizing = "fit-content" | "fill";

export type InteractionControlProps = {
    id?: string;
    flags: InteractionFlags;
    ref?: (element: HTMLElement) => void;
    renderContent: (getFlags: () => InteractionFlags) => JSX.Element;
};

export type InteractionTooltipDefs = Omit<TooltipProps, "getAnchorRef" | "renderContent"> & {
    renderContent: (
        getVisibilityTarget: () => 0 | 1,
        getTransitionDurationMs: () => number,
        getPlacement: () => TooltipPlacement,
        getFlags: () => InteractionFlags,
    ) => JSX.Element;
};

export type InteractionWrapperProps = AccessorProps<
    ExternalInteractionFlags & {
        sizing?: InteractionSizing;
        isReachableWhenDisabled?: boolean;
        isTabbable?: boolean;
        tooltipDefs?: InteractionTooltipDefs;
        ref?: (element: HTMLElement) => void;
        renderDecoration?: (getFlags: () => InteractionFlags) => JSX.Element;
        renderControl: (setElementRef: (element: HTMLElement) => void, getFlags: () => InteractionFlags) => JSX.Element;
    }
>;
