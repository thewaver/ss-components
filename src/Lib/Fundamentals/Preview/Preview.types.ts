import type { JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../InteractionWrapper/InteractionWrapper.types";

export type PreviewSizing = "fit-content" | "fill";

export type PreviewFlags = {
    isExpanded: boolean;
};

export type PreviewOverlayRenderer = (
    getVisibilityTarget: () => 0 | 1,
    getTransitionDurationMs: () => number,
) => JSX.Element;

export type PreviewTriggerProps = AccessorProps<
    Omit<InteractionControlProps<PreviewFlags>, "renderContent"> & {
        contentId: string;
        isExpanded: boolean;
    }
> & {
    renderTrigger: (getFlags: () => InteractionFlags<PreviewFlags>) => JSX.Element;
    onToggle: () => void;
};

export type PreviewProps = Omit<
    InteractionWrapperProps<PreviewFlags>,
    "renderControl" | "extraFlags" | "sizing" | "minWidth" | "minHeight"
> &
    AccessorProps<{
        id?: string;
        sizing?: PreviewSizing;
        collapsedHeight: number;
        isScrolledIntoViewOnCollapse?: boolean;
        transitionDurationMs?: number;
    }> & {
        expandedSignal: Signal<boolean>;
        renderContent: () => JSX.Element;
        renderTrigger: (getFlags: () => InteractionFlags<PreviewFlags>) => JSX.Element;
        renderOverlay?: PreviewOverlayRenderer;
    };
