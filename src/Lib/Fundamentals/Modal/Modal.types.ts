import type { JSX } from "solid-js";

import type { CSSMargin } from "../../Abstracts/CSS/CSS.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ModalProps = AccessorProps<{
    isVisible: boolean;
    transitionDurationMs?: number;
    margins?: CSSMargin;
    onShow?: () => void;
    onHide?: () => void;
    onTransitionStatusChange?: (hasTransitionFinished: boolean) => void;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    renderContent: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}>;
