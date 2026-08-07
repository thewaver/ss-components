import type { Point2d } from "@thewaver/ss-utils";

import type { CellAnimationController } from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { CellAnimationKeyframes } from "../../Samples/CellAnimation.const";
import type { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints.const";

export type CellAnimationExampleProps = AccessorProps<{
    src: string;
    cellCount: Point2d;
    origin: Point2d;
    breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
    animationType: CellAnimationKeyframes.AnimationType;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    computeCellWeights: (count: Point2d) => number[][];
    onMount: (controller: CellAnimationController) => void;
}>;
