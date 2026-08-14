import type { Signal } from "solid-js";

import type { Point2d } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import type { CellAnimationKeyframes } from "../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";

export type CellAnimationExampleProps = AccessorProps<{
    src: string;
    cellCount: Point2d;
    origin: Point2d;
    breakpointOpts: CellAnimationBreakpoints.BreakpointOpts;
    animationType: CellAnimationKeyframes.AnimationType;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    computeCellWeights: (count: Point2d) => number[][];
    playbackSignal: Signal<boolean>;
}>;
