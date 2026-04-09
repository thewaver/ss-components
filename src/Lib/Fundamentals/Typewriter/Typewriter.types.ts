import { AccessorProps } from "../../Utils/typeUtils";

export type TypewriterProps = AccessorProps<{
    animationDurationMs?: number;
    animationDelayMs?: number;
    animationName?: string;
    onAnimationEnd?: () => void;
}>;
