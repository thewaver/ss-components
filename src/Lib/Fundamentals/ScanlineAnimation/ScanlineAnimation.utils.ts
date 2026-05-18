import { MathUtils } from "@thewaver/ss-utils";

const reverseBits = (n: number, bits: number) => {
    let r = 0;

    for (let i = 0; i < bits; i++) {
        r = (r << 1) | ((n >> i) & 1);
    }

    return r;
};

export namespace ScanlineAnimationBreakpoints {
    export type Direction = "asc" | "desc";

    export type OrderingType =
        | "linear"
        | "converge"
        | "evenOdd"
        | "interleaved"
        | "reverseBinary"
        | "strided"
        | "wave";

    export type OrderingDefs<T extends OrderingType> = (T extends "strided" ? { stride: number; } : Record<string, never>);

    export type OrderingFn<T extends OrderingType> = (idx: number, lineCount: number, defs: OrderingDefs<T>) => number;

    export type BreakpointOpts = {
        dir?: Direction;
        smoothness?: number;
    }

    const applyDirection = (
        idx: number,
        lineCount: number,
        dir: Direction = "asc",
    ) => dir === "desc" ? lineCount - 1 - idx : idx;

    const orderingRegistry: { [K in OrderingType]: OrderingFn<K>} = {
        linear: (idx) => idx,
        
        converge: (idx, lineCount) => {
            const t = lineCount <= 1 ? 0.5 : idx / (lineCount - 1);
            const edgeDistance = Math.abs(t - 0.5) * 2;
        
            return Math.round((1 - edgeDistance) * (lineCount - 1));
        },

        evenOdd: (idx, lineCount) => {
            const evenCount = Math.ceil(lineCount / 2);
        
            return MathUtils.isEven(idx)
                ? idx / 2
                : evenCount + Math.floor(idx / 2);
        },

        interleaved: (idx, lineCount) => {
            const pair = Math.floor(idx * 0.5);
        
            return MathUtils.isEven(idx)
                ? pair
                : lineCount - 1 - pair;
        },

        reverseBinary: (idx, lineCount) => {
            const bits = Math.ceil(Math.log2(lineCount));

            return reverseBits(idx, bits) % lineCount;
        },

        strided: (idx, lineCount, defs) => {
            const groupSize = Math.ceil(lineCount / defs.stride);
            const group = idx % defs.stride;
            const pos = Math.floor(idx / defs.stride);
        
            return pos + group * groupSize;
        },

        wave: (idx, lineCount) => {
            const t = lineCount <= 1 ? 0.5 : idx / (lineCount - 1);
            const v = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
        
            return Math.floor(v * (lineCount - 1));
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
        const directedIdx = applyDirection(orderedIdx, lineCount, opts?.dir ?? "asc" );
        const smoothness = (opts?.smoothness ?? 0.5) * 0.5;
        const step = 1 / (lineCount + 1);
        const middle = step * directedIdx + step;
        
        return [
            Math.max(0, middle - smoothness),
            middle,
            Math.min(1, middle + smoothness),
        ] as [number, number, number];
    };
}

export namespace ScanlineAnimationKeyframes {
    export type HorizontalShiftOpts = {
        maxShift?: number;
        chunkyness?: number;
    };

    const DEFAULT_HORIZONTAL_SHIFT_OPTS: Required<HorizontalShiftOpts> = {
        maxShift: 10,
        chunkyness: 0.5,
    };

    let shiftPercent = [0];

    export const getRandomHorizontalShiftKeyframes = (
        breakpoints: [number, number, number, number][],
        opts?: HorizontalShiftOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SHIFT_OPTS, ...opts };

        return [
            { offset: 0, transform: "translateX(0)" },
            ...breakpoints.flatMap((breakpoint, idx) => {
                if (!shiftPercent[idx] || Math.random() > mergedOpts.chunkyness) {
                    shiftPercent[idx] = Math.random() * mergedOpts?.maxShift * 2 - mergedOpts?.maxShift;
                }

                return [
                    { offset: breakpoint[0], transform: "translateX(0)" },
                    { offset: breakpoint[1], transform: `translateX(${shiftPercent[idx]}%)` },
                    { offset: breakpoint[2], transform: `translateX(${shiftPercent[idx]}%)` },
                    { offset: breakpoint[3], transform: "translateX(0)" },
                ];
            }),
            { offset: 1, transform: "translateX(0)" },
        ];
    };

    export type HorizontalStretchOpts = {
        peakScalePercent?: number;
    };

    const DEFAULT_HORIZONTAL_STRETCH_OPTS: Required<HorizontalStretchOpts> = {
        peakScalePercent: 150,
    };

    export const getHorizontalStretchKeyframes = (
        breakpoints: [number, number, number],
        opts?: HorizontalStretchOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STRETCH_OPTS, ...opts };

        return [
            { offset: 0, transform: "scaleX(1)" },
            { offset: breakpoints[0], transform: "scaleX(1)" },
            { offset: breakpoints[1], transform: `scaleX(${mergedOpts.peakScalePercent}%)` },
            { offset: breakpoints[2], transform: "scaleX(1)" },
            { offset: 1, transform: "scaleX(1)" },
        ];
    };

    export type HorizontalSnakeOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SNAKE_OPTS: Required<HorizontalSnakeOpts> = {
        shiftPercent: 5,
    };

    export const getHorizontalSnakeKeyframes = (
        breakpoints: [number, number, number],
        opts?: HorizontalSnakeOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SNAKE_OPTS, ...opts };

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: breakpoints[0], transform: "translateX(0)" },
            { offset: (breakpoints[0] + breakpoints[1]) * 0.5, transform: `translateX(${-mergedOpts.shiftPercent}%)` },
            { offset: breakpoints[1], transform: "translateX(0)" },
            { offset: (breakpoints[2] + breakpoints[1]) * 0.5, transform: `translateX(${+mergedOpts.shiftPercent}%)` },
            { offset: breakpoints[2], transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };

    export type HorizontalHueOpts = {
        filterDir?: "color" | "hue";
    };

    const DEFAULT_HORIZONTAL_HUE_OPTS: Required<HorizontalHueOpts> = {
        filterDir: "hue",
    };

    export const getHorizontalHueKeyframes = (
        breakpoints: [number, number, number],
        opts?: HorizontalHueOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_HUE_OPTS, ...opts };
        const startValue = mergedOpts?.filterDir === "color" ? 0 : 180;
        const endValue = mergedOpts?.filterDir === "color" ? 180 : 0;

        return [
            { offset: 0, filter: `hue-rotate(${startValue}deg)` },
            { offset: breakpoints[0], filter: `hue-rotate(${startValue}deg)` },
            { offset: breakpoints[1], filter: `hue-rotate(${endValue}deg)` },
            { offset: breakpoints[2], filter: `hue-rotate(${endValue}deg)` },
            { offset: 1, filter: `hue-rotate(${endValue}deg)` },
        ];
    };

    export type HorizontalGrayscaleOpts = {
        filterDir?: "color" | "gray";
    };

    const DEFAULT_HORIZONTAL_GRAYSCALE_OPTS: Required<HorizontalGrayscaleOpts> = {
        filterDir: "gray",
    };

    export const getHorizontalGrayscaleKeyframes = (
        breakpoints: [number, number, number],
        opts?: HorizontalGrayscaleOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_GRAYSCALE_OPTS, ...opts };
        const startValue = mergedOpts?.filterDir === "color" ? 0 : 1;
        const endValue = mergedOpts?.filterDir === "color" ? 1 : 0;

        return [
            { offset: 0, filter: `grayscale(${startValue})` },
            { offset: breakpoints[0], filter: `grayscale(${startValue})` },
            { offset: breakpoints[1], filter: `grayscale(${endValue})` },
            { offset: breakpoints[2], filter: `grayscale(${endValue})` },
            { offset: 1, filter: `grayscale(${endValue})` },
        ];
    };

    export type HorizontalSplitOpts = {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SPLIT_OPTS: Required<HorizontalSplitOpts> = {
        shiftPercent: 10,
    };

    export const getHorizontalSplitKeyframes = (
        breakpoints: [number, number, number],
        idx: number,
        opts?: HorizontalSplitOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SPLIT_OPTS, ...opts };

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: breakpoints[0], transform: "translateX(0)" },
            { offset: breakpoints[1], transform: `translateX(${mergedOpts.shiftPercent * (MathUtils.isEven(idx) ? -1 : 1)}%)` },
            { offset: breakpoints[2], transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };
}
