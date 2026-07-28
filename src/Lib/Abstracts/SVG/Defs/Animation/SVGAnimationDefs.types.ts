export type SVGAnimationIterationPattern = {
    count: number;
    beginDelayMs?: number;
    nextIndex?: number;
}

export type SVGAnimationDefs = {
    id?: string;
    animationDurationMs: number;
    animationIterationPatterns?: SVGAnimationIterationPattern[];
    onAnimationEnd?: () => void;
    onAnimationIteration?: (next: number) => void;
};
