import { MathUtils } from "@thewaver/ss-utils";

export namespace CellAnimationBreakpoints {
    export const DIRECTIONS = ["asc", "desc"] as const;
    export type Direction = (typeof DIRECTIONS)[number];

    export const EASINGS = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"] as const;
    export type Easing = (typeof EASINGS)[number];

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
        easing?: Easing;
    };

    export type BreakpointTupleTriple = [start: number, middle: number, end: number];

    const DEFAULT_SMOOTHNESS = 0.25;
    const DEFAULT_EASING: Easing = "linear";

    const EASING_CONTROLS: Record<Exclude<Easing, "linear">, [number, number, number, number]> = {
        "ease": [0.25, 0.1, 0.25, 1],
        "ease-in": [0.42, 0, 1, 1],
        "ease-out": [0, 0, 0.58, 1],
        "ease-in-out": [0.42, 0, 0.58, 1],
    };

    const NEWTON_ITERATIONS = 8;
    const BISECTION_ITERATIONS = 16;
    const SOLVE_EPSILON = 1e-6;

    const computeAxis = (first: number, second: number) => {
        const c = 3 * first;
        const b = 3 * (second - first) - c;

        return { a: 1 - c - b, b, c };
    };

    const computeCurve = ({ a, b, c }: { a: number; b: number; c: number }, t: number) => ((a * t + b) * t + c) * t;

    const computeSlope = ({ a, b, c }: { a: number; b: number; c: number }, t: number) => (3 * a * t + 2 * b) * t + c;

    const computeEasedRatio = (easing: Easing, ratio: number) => {
        if (easing === DEFAULT_EASING) return ratio;

        const [x1, y1, x2, y2] = EASING_CONTROLS[easing];
        const x = computeAxis(x1, x2);
        const y = computeAxis(y1, y2);

        let t = ratio;

        for (let step = 0; step < NEWTON_ITERATIONS; step++) {
            const error = computeCurve(x, t) - ratio;

            if (Math.abs(error) < SOLVE_EPSILON) return computeCurve(y, t);

            const slope = computeSlope(x, t);

            if (Math.abs(slope) < SOLVE_EPSILON) break;

            t -= error / slope;
        }

        let low = 0;
        let high = 1;

        t = ratio;

        for (let step = 0; step < BISECTION_ITERATIONS; step++) {
            const error = computeCurve(x, t) - ratio;

            if (Math.abs(error) < SOLVE_EPSILON) break;

            if (error > 0) high = t;
            else low = t;

            t = (low + high) / 2;
        }

        return computeCurve(y, t);
    };

    export const computeBreakpoints = (weight: number, opts?: BreakpointOpts): BreakpointTupleTriple => {
        const directed = opts?.dir === "desc" ? weight : 1 - weight;
        const progress = MathUtils.clamp01(directed);
        const half = MathUtils.clamp01(opts?.smoothness ?? DEFAULT_SMOOTHNESS) * 0.5;
        const start = progress * (1 - 2 * half);

        return [start, start + half, start + 2 * half];
    };

    export const computeLocalTimeline = (
        [start, , end]: BreakpointTupleTriple,
        timeline: number,
        easing: Easing = DEFAULT_EASING,
    ) => {
        if (end <= start) return timeline >= end ? 1 : 0;

        return computeEasedRatio(easing, MathUtils.clamp01(MathUtils.normalize(timeline, start, end)));
    };
}
