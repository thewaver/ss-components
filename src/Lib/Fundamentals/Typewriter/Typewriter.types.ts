import type { AccessorProps } from "../../Utils/typeUtils";

export type TypewriterUpdateCause = "controller" | "content" | "layout";

export type TypewriterController = {
    restartAnimation: () => boolean;
    update: (cause: TypewriterUpdateCause) => void;
};

export type TypewriterProps = AccessorProps<{
    animationName?: string;
    animationDurationMs?: number;
    animationDelayMs?: number;
    initialAnimationDelayMs?: number;
    resetAnimationOnLayout?: boolean;
    resetAnimationOnContent?: boolean;
    getController?: (controller: TypewriterController) => void;
    onAnimationEnd?: () => void;
}>;
