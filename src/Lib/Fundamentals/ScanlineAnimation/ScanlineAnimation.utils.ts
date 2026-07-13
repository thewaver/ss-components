import { MathUtils } from "@thewaver/ss-utils";

import { CSSConst } from "../../Abstracts/CSS/CSS.const";
import { type CSSAnimationKey, CSS_TRANSFORM_KEYS } from "../../Abstracts/CSS/CSS.types";
import type { ScanlineAnimationEvaluationResult } from "./ScanlineAnimation.types";

const reverseBits = (n: number, bits: number) => {
    let r = 0;

    for (let i = 0; i < bits; i++) {
        r = (r << 1) | ((n >> i) & 1);
    }

    return r;
};

export namespace ScanlineAnimationBreakpoints {
    export const DIRECTIONS = ["asc", "desc"] as const;
    export type Direction = (typeof DIRECTIONS)[number];

    export const ORDER_TYPES = ["linear", "converge", "evenOdd", "interleaved", "reverseBinary"] as const;
    export type OrderingType = (typeof ORDER_TYPES)[number];

    export type OrderingDefs<T extends OrderingType> = /* T extends "custom-order-type" ? { custom-props } : */ Record<
        string,
        never
    >;

    export type OrderingFn<T extends OrderingType> = (idx: number, lineCount: number, defs: OrderingDefs<T>) => number;

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
    };

    export type BreakpointTupleTriple = [start: number, middle: number, end: number];

    const applyDirection = (idx: number, lineCount: number, dir: Direction = "asc") =>
        dir === "desc" ? lineCount - 1 - idx : idx;

    const orderingRegistry: { [K in OrderingType]: OrderingFn<K> } = {
        linear: (idx) => idx,

        converge: (idx, lineCount) => {
            const t = lineCount <= 1 ? 0.5 : idx / (lineCount - 1);
            const edgeDistance = Math.abs(t - 0.5) * 2;

            return Math.round((1 - edgeDistance) * (lineCount - 1));
        },

        evenOdd: (idx, lineCount) => {
            const evenCount = Math.ceil(lineCount * 0.5);

            return MathUtils.isEven(idx) ? idx * 0.5 : evenCount + Math.floor(idx * 0.5);
        },

        interleaved: (idx, lineCount) => {
            const pair = Math.floor(idx * 0.5);

            return MathUtils.isEven(idx) ? pair : lineCount - 1 - pair;
        },

        reverseBinary: (idx, lineCount) => {
            const bits = Math.ceil(Math.log2(lineCount));

            return reverseBits(idx, bits) % lineCount;
        },
    };

    export const getBreakpoints = <T extends OrderingType>(
        type: T,
        idx: number,
        lineCount: number,
        defs: OrderingDefs<T>,
        opts?: BreakpointOpts,
    ) => {
        const orderedIdx = orderingRegistry[type](idx, lineCount, defs);
        const directedIdx = applyDirection(orderedIdx, lineCount, opts?.dir ?? "asc");
        const smoothness = (opts?.smoothness ?? 0.5) * 0.5;
        const step = 1 / (lineCount + 1);
        const middle = step * directedIdx + step;

        return [Math.max(0, middle - smoothness), middle, Math.min(1, middle + smoothness)] as BreakpointTupleTriple;
    };
}

export namespace ScanlineAnimationKeyframes {
    const peak = (a: number, b: number, x: number) => {
        const mid = (a + b) * 0.5;

        if (x < a || x > b) return 0;
        if (x <= mid) return (x - a) / (mid - a);
        return (b - x) / (b - mid);
    };

    export type HorizontalSnakeOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SNAKE_OPTS: Required<HorizontalSnakeOpts> = {
        shiftPercent: 5,
    };

    export const evaluateHorizontalSnake = (
        [b0, b1, b2]: ScanlineAnimationBreakpoints.BreakpointTupleTriple,
        idx: number,
        t: number,
        opts?: HorizontalSnakeOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SNAKE_OPTS, ...opts };
        const leftWave = peak(b0, b1, t) * -mergedOpts.shiftPercent;
        const rightWave = peak(b1, b2, t) * mergedOpts.shiftPercent;

        return {
            translateX: leftWave + rightWave,
        };
    };

    export type HorizontalSplitOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SPLIT_OPTS: Required<HorizontalSplitOpts> = {
        shiftPercent: 10,
    };

    export const evaluateHorizontalSplit = (
        [b0, b1, b2]: ScanlineAnimationBreakpoints.BreakpointTupleTriple,
        idx: number,
        t: number,
        opts?: HorizontalSplitOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SPLIT_OPTS, ...opts };
        const dir = MathUtils.isEven(idx) ? -1 : 1;
        const p = peak(b0, b2, t);

        return {
            translateX: dir * mergedOpts.shiftPercent * p,
        };
    };

    export type HorizontalStretchOpts = {
        peakScalePercent?: number;
    };

    const DEFAULT_HORIZONTAL_STRETCH_OPTS: Required<HorizontalStretchOpts> = {
        peakScalePercent: 150,
    };

    export const evaluateHorizontalStretch = (
        [b0, b1, b2]: ScanlineAnimationBreakpoints.BreakpointTupleTriple,
        idx: number,
        t: number,
        opts?: HorizontalStretchOpts,
    ): ScanlineAnimationEvaluationResult => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STRETCH_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return {
            scaleX: 100 + p * (mergedOpts.peakScalePercent - 100),
        };
    };

    export type HorizontalHueOpts = {};

    // const DEFAULT_HORIZONTAL_HUE_OPTS: Required<HorizontalHueOpts> = {};

    export const evaluateHorizontalHue = (
        [b0, b1, b2]: ScanlineAnimationBreakpoints.BreakpointTupleTriple,
        idx: number,
        t: number,
        opts?: HorizontalHueOpts,
    ): ScanlineAnimationEvaluationResult => {
        // const mergedOpts = { ...DEFAULT_HORIZONTAL_HUE_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return {
            "hue-rotate": 180 * p,
        };
    };

    export type HorizontalGrayscaleOpts = {};

    // const DEFAULT_HORIZONTAL_GRAYSCALE_OPTS: Required<HorizontalGrayscaleOpts> = {};

    export const evaluateHorizontalGrayscale = (
        [b0, b1, b2]: ScanlineAnimationBreakpoints.BreakpointTupleTriple,
        idx: number,
        t: number,
        opts?: HorizontalGrayscaleOpts,
    ): ScanlineAnimationEvaluationResult => {
        // const mergedOpts = { ...DEFAULT_HORIZONTAL_GRAYSCALE_OPTS, ...opts };
        const p = peak(b0, b2, t);

        return {
            grayscale: 180 * p,
        };
    };
}

export namespace ScanlineAnimationUtils {
    export const assignAnimationProps = (el: HTMLElement, evalResult: Partial<Record<CSSAnimationKey, number>>) => {
        const transforms: string[] = [];
        const filters: string[] = [];

        for (const [key, value] of Object.entries(evalResult)) {
            const k = key as CSSAnimationKey;
            const prop = `${k}(${value}${CSSConst.ANIMATION_UNITS[k]})`;

            if (CSS_TRANSFORM_KEYS.includes(k as any)) {
                transforms.push(prop);
            } else {
                filters.push(prop);
            }
        }

        if (transforms.length) {
            el.style.transform = transforms.join(" ");
        }

        if (filters.length) {
            el.style.filter = filters.join(" ");
        }
    };
}
