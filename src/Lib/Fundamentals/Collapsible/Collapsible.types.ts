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
    "renderControl" | "getExtraFlags" | "getSizing" | "getMinWidth" | "getMinHeight"
> &
    AccessorProps<{
        id?: string;
        sizing?: CollapsibleSizing;
        transitionDurationMs?: number;
        /**
         * A heading is optional because a disclosure is not always a section. A "show more" at the end of a
         * paragraph is a control inside prose, and wrapping it in an `h3` would put a heading in the document
         * outline that no reader would agree is one. Give a level only where the trigger really does label a
         * section of the page — which is what `Accordion` does for every one of its own.
         */
        headingLevel?: number;
        /**
         * The panel's role and the ARIA that role requires, in `Popover`'s shape: one role plus one bag,
         * rather than a prop per attribute. A bare disclosure needs neither — `aria-expanded` on the trigger
         * and `aria-controls` pointing here is the whole of the published pattern — while an accordion's
         * panel is a `region` named by its own header.
         */
        panelRole?: JSX.HTMLAttributes<HTMLElement>["role"];
        panelAriaAttributes?: JSX.AriaAttributes;
    }> & {
        expandedSignal: Signal<boolean>;
        renderTrigger: (getFlags: () => InteractionFlags<CollapsibleFlags>) => JSX.Element;
        renderPanel: CollapsiblePanelRenderer;
    };
