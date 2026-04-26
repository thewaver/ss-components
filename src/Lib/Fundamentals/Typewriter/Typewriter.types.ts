import { AccessorProps } from "../../Utils/typeUtils";

export type TypewriterProps = AccessorProps<{
    animationName?: string;
    animationDurationMs?: number;
    animationDelayMs?: number;
    initialAnimationDelayMs?: number;
    resetAnimationOnResize?: boolean;
    onAnimationEnd?: () => void;
}>;
