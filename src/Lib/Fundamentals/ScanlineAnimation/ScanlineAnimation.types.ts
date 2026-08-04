import type { CSSAnimationKey } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../Utils/typeUtils";

export type ScanlineAnimationEvaluationResult = Partial<Record<CSSAnimationKey, number>>;

export type ScanlineAnimationController = {
    start: () => void;
    stop: () => void;
};

export type ScanlineAnimationProps = AccessorProps<{
    src: string;
    ariaLabel?: string;
    sizeAnchor?: "width" | "height";
    lineCount: number;
    animationDurationMs?: number;
    animationIterationCount?: number;
    animationIterationDelayMs?: number;
    onMount?: (controller: ScanlineAnimationController) => void;
    computeRootAnimation?: (timeline: number) => ScanlineAnimationEvaluationResult;
    computeScanlineAnimation: (
        index: number,
        lineCount: number,
        timeline: number,
    ) => ScanlineAnimationEvaluationResult;
    onIterationEnd?: () => void;
    onAnimationEnd?: () => void;
}>;
