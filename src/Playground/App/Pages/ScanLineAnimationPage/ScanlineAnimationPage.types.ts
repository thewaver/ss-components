import type { Point2d } from "@thewaver/ss-utils";

import type { ScanlineAnimationController } from "../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScanlineAnimationExampleProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    computeCellWeights: (count: Point2d) => number[][];
    onMount: (controller: ScanlineAnimationController) => void;
}>;
