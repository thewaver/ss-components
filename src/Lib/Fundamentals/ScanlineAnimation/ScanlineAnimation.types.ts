import type { CSSAnimationKey } from "../../Abstracts/CSS/CSS.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ScanlineAnimationEvaluationResult = Partial<Record<CSSAnimationKey, number>>;

export type ScanlineAnimationController = {
    start: () => void;
    stop: () => void;
};

export type ScanlineAnimationProps = AccessorProps<{
    src: string;
    sizeAnchor?: "width" | "height";
    lineCount: number;
    animationDurationMs?: number;
    animationIterationCount?: number;
    animationIterationDelayMs?: number;
    rootAnimationKeyframes?: Keyframe[];
    getController?: (controller: ScanlineAnimationController) => void;
    evaluateScanlineAnimation: (
        getIndex: () => number,
        getLineCount: () => number,
        getTimeline: () => number,
    ) => ScanlineAnimationEvaluationResult;
    onAnimationEnd?: () => void;
}>;
