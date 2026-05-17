import type { JSX } from "solid-js";

import type { AccessorProps } from "../../Utils/typeUtils";

export type ModalProps = AccessorProps<{
    isVisible: boolean;
    transitionDurationMs?: number;
    onShow?: () => void;
    onHide?: () => void;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    renderContent: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}>;
