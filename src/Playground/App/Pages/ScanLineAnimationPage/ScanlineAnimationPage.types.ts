import type { Signal } from "solid-js";

import type { Point2d } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ScanlineAnimationExampleProps = AccessorProps<{
    src: string;
    lineCount: number;
    animationDurationMs: number;
    animationIterationDelayMs: number;
    computeCellWeights: (count: Point2d) => number[][];
    playbackSignal: Signal<boolean>;
}>;
