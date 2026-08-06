import type { Point2d } from "@thewaver/ss-utils";

import type { CellAnimationController } from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.types";
import type {
    CellAnimationBreakpoints,
    CellAnimationOrigins,
    CellAnimationWeights,
} from "../../../../Lib/Fundamentals/CellAnimation/CellAnimation.utils";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { CellAnimationKeyframesConst } from "../../Samples/CellAnimation.const";

export type CellAnimationExampleProps = AccessorProps<{
    src: string;
    cellCount: Point2d;
    originType: CellAnimationOrigins.OriginType;
    weightType: CellAnimationWeights.WeightType;
    weightOpts: CellAnimationWeights.WeightOpts;
    breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
    animationType: CellAnimationKeyframesConst.AnimationType;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    onMount: (controller: CellAnimationController) => void;
}>;
