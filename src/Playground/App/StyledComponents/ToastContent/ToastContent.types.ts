import type { Toast, ToastState } from "../../../../Lib/Fundamentals/Toasts/Toasts.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ToastKind = "info" | "success" | "error";

export type ToastAnimation = "zoom" | "slide" | "fade";

export type ToastDefs = {
    kind: ToastKind;
    message: string;
};

export type ToastContentProps = AccessorProps<{
    toast: Toast<ToastDefs>;
    state: ToastState;
    animation: ToastAnimation;
    visibilityTarget: 0 | 1;
    transitionDurationMs: number;
    onDismiss: () => void;
}>;
