import { JSX } from "solid-js";
import { AccessorProps } from "src/Lib/Utils/typeUtils";

export type ElementHighlightProps = AccessorProps<{
    elementRef: HTMLDivElement | undefined;
    isVisible: boolean;
    padding?: number;
    transitionDurationMs?: number;
    renderHighlight?: () => JSX.Element;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}>;
