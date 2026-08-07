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
        const progress = Math.min(Math.max(directed, 0), 1);
        const half = Math.min(Math.max(opts?.smoothness ?? DEFAULT_SMOOTHNESS, 0), 1) * 0.5;
        const start = progress * (1 - 2 * half);

        return [start, start + half, start + 2 * half];
    };

    export const computeLocalTimeline = ([start, , end]: BreakpointTupleTriple, timeline: number) => {
        if (end <= start) return timeline >= end ? 1 : 0;

        return Math.min(Math.max((timeline - start) / (end - start), 0), 1);
    };
}
