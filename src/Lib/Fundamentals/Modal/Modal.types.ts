import type { JSX, Signal } from "solid-js";

import type { CSSMargin } from "@thewaver/ss-utils";

import type { AccessorProps, MaybeAccessor } from "../../Utils/typeUtils";

export type ModalRole = "dialog" | "alertdialog";

export type ModalAlignment = "center" | "left" | "right" | "top" | "bottom";

export type ModalProps = AccessorProps<{
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    role?: ModalRole;
    alignment?: ModalAlignment;
    isDismissableOnOverlayClick?: boolean;
    visibilitySignal: Signal<boolean>;
    transitionDurationMs?: number;
    margins?: CSSMargin;
    onShow?: () => void;
    onHide?: () => void;
    onTransitionStatusChange?: (hasTransitionFinished: boolean) => void;
    renderOverlay: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
    renderContent: (getVisibilityTarget: () => 0 | 1, getTransitionDurationMs: () => number) => JSX.Element;
}> & {
    initialFocusRef?: MaybeAccessor<HTMLElement | undefined>;
};
