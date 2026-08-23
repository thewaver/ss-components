import type { JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../Abstracts/Interaction/Interaction.types";
import type { AccessorProps } from "../../Utils/typeUtils";
import type { InteractionControlProps, InteractionWrapperProps } from "../InteractionWrapper/InteractionWrapper.types";

export type CollapsibleSizing = "fit-content" | "fill";

export type CollapsibleFlags = {
    isExpanded: boolean;
};

export type CollapsiblePanelRenderer = (
    getVisibilityTarget: () => 0 | 1,
    getTransitionDurationMs: () => number,
) => JSX.Element;

export type CollapsibleTriggerProps = AccessorProps<
    Omit<InteractionControlProps<CollapsibleFlags>, "renderContent"> & {
        panelId: string;
        isExpanded: boolean;
    }
> & {
    renderTrigger: (getFlags: () => InteractionFlags<CollapsibleFlags>) => JSX.Element;
    onToggle: () => void;
};

export type CollapsibleProps = Omit<
    InteractionWrapperProps<CollapsibleFlags>,
    "renderControl" | "extraFlags" | "sizing" | "minWidth" | "minHeight"
> &
    AccessorProps<{
        id?: string;
        sizing?: CollapsibleSizing;
        transitionDurationMs?: number;
        headingLevel?: number;
        isScrolledIntoViewOnExpand?: boolean;
        panelRole?: JSX.HTMLAttributes<HTMLElement>["role"];
        panelAriaAttributes?: JSX.AriaAttributes;
    }> & {
        expandedSignal: Signal<boolean>;
        renderTrigger: (getFlags: () => InteractionFlags<CollapsibleFlags>) => JSX.Element;
        renderPanel: CollapsiblePanelRenderer;
    };
