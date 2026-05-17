import type { JSX } from "solid-js";

import type { AccessorProps } from "../../../Lib/Utils/typeUtils";

export type ElementHighlightProps = AccessorProps<{
    isVisible: boolean;
    padding?: number;
    transitionDurationMs?: number;
    getElementRef: () => HTMLElement | undefined;
    onShow?: () => void;
    onHide?: () => void;
    renderHighlight?: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}>;
