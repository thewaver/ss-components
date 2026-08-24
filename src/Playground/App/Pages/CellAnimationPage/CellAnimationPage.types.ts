import type { Signal } from "solid-js";

import type { Point2d } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import type { CellAnimationKeyframes } from "../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";
import type { CellAnimationOrigins } from "../../Samples/CellAnimationOrigins/CellAnimationOrigins.const";
import type { CellAnimationWeights } from "../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import type { WeightOpts } from "../../Samples/CellAnimationWeights/CellAnimationWeights.types";

export type CellAnimationExampleProps = AccessorProps<{
    cellCount: Point2d;
    originType: CellAnimationOrigins.OriginType;
    weightType: CellAnimationWeights.WeightType;
    weightOpts: WeightOpts;
    breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
    animationType: CellAnimationKeyframes.AnimationType;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    playbackSignal: Signal<boolean>;
}>;

export type CellAnimationSourcedExampleProps = CellAnimationExampleProps & AccessorProps<{ src: string }>;
