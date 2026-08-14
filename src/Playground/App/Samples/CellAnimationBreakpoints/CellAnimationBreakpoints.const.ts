import { MathUtils } from "@thewaver/ss-utils";

export namespace CellAnimationBreakpoints {
    export const DIRECTIONS = ["asc", "desc"] as const;
    export type Direction = (typeof DIRECTIONS)[number];

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
    };

    export type BreakpointTupleTriple = [start: number, middle: number, end: number];

    const DEFAULT_SMOOTHNESS = 0.25;

    export const computeBreakpoints = (weight: number, opts?: BreakpointOpts): BreakpointTupleTriple => {
        const directed = opts?.dir === "desc" ? weight : 1 - weight;
        const progress = MathUtils.clamp01(directed);
        const half = MathUtils.clamp01(opts?.smoothness ?? DEFAULT_SMOOTHNESS) * 0.5;
        const start = progress * (1 - 2 * half);

        return [start, start + half, start + 2 * half];
    };

    export const computeLocalTimeline = ([start, , end]: BreakpointTupleTriple, timeline: number) => {
        if (end <= start) return timeline >= end ? 1 : 0;

        return MathUtils.clamp01(MathUtils.normalize(timeline, start, end));
    };
}
