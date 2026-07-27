import type { AccessorProps } from "../../../../Utils/typeUtils";

export type SVGAnimationDefs = AccessorProps<{
    id?: string;
    animationDurationMs: number;
    animationIterationPattern?: {
        count: number;
        begin: string;
    }[];
    shouldRepeatAnimationPattern?: boolean;
    onAnimationEnd?: () => void;
    onAnimationIteration?: (next: number) => void;
}>;
