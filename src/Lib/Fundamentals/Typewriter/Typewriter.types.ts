import type { AccessorProps } from "../../Utils/typeUtils";

export type TypewriterController = {
    restartAnimation: () => boolean;
};

export type TypewriterProps = AccessorProps<{
    animationName?: string;
    animationDurationMs?: number;
    animationDelayMs?: number;
    initialAnimationDelayMs?: number;
    resetAnimationOnResize?: boolean;
    getController?: (controller: TypewriterController) => void;
    onAnimationEnd?: () => void;
}>;
