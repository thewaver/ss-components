export type SVGAnimationIterationPattern = {
    count: number;
    beginEvent?: string;
    beginDelayMs?: number;
    nextIndex?: number;
};

export type SVGAnimationDefs = {
    animationDurationMs: number;
    animationIterationPatterns?: SVGAnimationIterationPattern[];
    onAnimationEnd?: () => void;
    onAnimationIteration?: (next: number) => void;
};
