import type { JSX, Signal } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type ElementHighlightProps = AccessorProps<{
    visibilitySignal: Signal<boolean>;
    padding?: number;
    transitionDurationMs?: number;
    elementRef: HTMLElement | undefined;
    onShow?: () => void;
    onHide?: () => void;
    renderHighlight?: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}>;
