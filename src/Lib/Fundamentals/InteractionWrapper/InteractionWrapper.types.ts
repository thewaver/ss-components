import type { JSX } from "solid-js";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import type { ExternalInteractionFlags, InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";
import type { TooltipProps } from "../Tooltip/Tooltip.types";

export type InteractionSizing = "fit-content" | "fill";

export type InteractionControlProps<TExtra extends object = {}> = {
    id?: string;
    ariaLabel?: string;
    flags: InteractionFlags<TExtra>;
    ref?: (element: HTMLElement) => void;
    renderContent: (getFlags: () => InteractionFlags<TExtra>) => JSX.Element;
};

export type InteractionTooltipDefs<TExtra extends object = {}> = Omit<TooltipProps, "anchorRef" | "renderContent"> & {
    renderContent: (
        getVisibilityTarget: () => 0 | 1,
        getTransitionDurationMs: () => number,
        getPlacement: () => AnchorPlacement,
        getFlags: () => InteractionFlags<TExtra>,
    ) => JSX.Element;
};

export type InteractionWrapperProps<TExtra extends object = {}> = AccessorProps<
    ExternalInteractionFlags & {
        role?: JSX.AriaAttributes["role"];
        sizing?: InteractionSizing;
        minWidth?: number;
        minHeight?: number;
        isReachableWhenDisabled?: boolean;
        isTabbable?: boolean;
        ref?: (element: HTMLElement) => void;
    }
> & {
    extraFlags?: MaybeAccessor<TExtra>;
    tooltipDefs?: MaybeAccessor<InteractionTooltipDefs<TExtra> | undefined>;
    renderDecoration?: (getFlags: () => InteractionFlags<TExtra>) => JSX.Element;
    renderControl: (
        setElementRef: (element: HTMLElement) => void,
        getFlags: () => InteractionFlags<TExtra>,
    ) => JSX.Element;
};
