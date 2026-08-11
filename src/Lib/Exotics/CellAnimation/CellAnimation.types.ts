import type { Signal } from "solid-js";

import type { CSSAnimationKey, Point2d, Size2d } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../Utils/typeUtils";

export type CellAnimationEvaluationResult = Partial<Record<CSSAnimationKey, number | number[]>>;

export type CellAnimationEvaluationDefs = {
    pos: Point2d;
    count: Point2d;
    weight: number;
    size: Size2d;
};

export type CellAnimationProps = AccessorProps<{
    src: string;
    ariaLabel?: string;
    sizeAnchor?: "width" | "height";
    cellCount: Point2d;
    animationDurationMs?: number;
    animationIterationCount?: number;
    animationIterationDelayMs?: number;
    playbackSignal?: Signal<boolean>;
    computeCellWeights?: (count: Point2d) => number[][];
    computeRootAnimation?: (timeline: number) => CellAnimationEvaluationResult;
    computeCellAnimation: (defs: CellAnimationEvaluationDefs, timeline: number) => CellAnimationEvaluationResult;
    onIterationEnd?: () => void;
    onAnimationEnd?: () => void;
}>;
