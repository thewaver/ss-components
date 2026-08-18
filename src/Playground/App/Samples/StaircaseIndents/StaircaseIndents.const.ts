import type { StaircaseIndentFn } from "./StaircaseIndents.types";

const REPEATING_SET_COUNT = 3;
const ALTERNATING_SET_COUNT = 3;

const linear: StaircaseIndentFn = (defs) => defs.index * defs.indent;

const hourglass: StaircaseIndentFn = (defs) => Math.min(defs.index, defs.stepCount - 1 - defs.index) * defs.indent * 2;

const easedIn: StaircaseIndentFn = (defs) => {
    const lastIndex = Math.max(1, defs.stepCount - 1);
    const ratio = defs.index / lastIndex;

    return ratio * ratio * lastIndex * defs.indent;
};

const easedOut: StaircaseIndentFn = (defs) => {
    const lastIndex = Math.max(1, defs.stepCount - 1);
    const ratio = 1 - defs.index / lastIndex;

    return (1 - ratio * ratio) * lastIndex * defs.indent;
};

const repeating: StaircaseIndentFn = (defs) => (defs.index % REPEATING_SET_COUNT) * defs.indent;

const alternating: StaircaseIndentFn = (defs) => {
    const peak = ALTERNATING_SET_COUNT - 1;
    const step = peak - Math.abs((defs.index % (peak * 2)) - peak);

    return step * defs.indent;
};

export namespace StaircaseIndents {
    export const SAMPLE_INDENTS = {
        linear,
        easedIn,
        easedOut,
        hourglass,
        repeating,
        alternating,
    } satisfies Record<string, StaircaseIndentFn>;

    export type SampleKey = keyof typeof SAMPLE_INDENTS;

    export const SAMPLE_KEYS = Object.keys(SAMPLE_INDENTS) as SampleKey[];
}
