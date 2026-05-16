import { MathUtils } from "@thewaver/ss-utils";

export namespace ScanlineAnimationUtils {
    export const getBreakpoints = (idx: number, lineCount: number, opts: Required<ScanlineAnimationOpts>) => {
        const step = 1 / (lineCount + 1); // 2 more steps than total
        const dirIdx = opts.dir === "bottom" ? lineCount - 1 - idx : idx;
        const middle = step * dirIdx + step;
        const start = Math.max(0, middle - opts.smoothness * 0.5);
        const end = Math.min(1, middle + opts.smoothness * 0.5);

        return { middle, start, end };
    };

    export type ScanlineAnimationDir = "top" | "bottom";

    export type ScanlineAnimationOpts = {
        dir?: ScanlineAnimationDir;
        smoothness?: number;
    };

    const DEFAULT_SCANLINE_ANIMATION_OPTS: Required<ScanlineAnimationOpts> = {
        dir: "top",
        smoothness: 0.1,
    };

    export type HorizontalShiftOpts = {
        maxShift?: number;
        chunkyness?: number;
    };

    const DEFAULT_HORIZONTAL_SHIFT_OPTS: Required<HorizontalShiftOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
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

    export type HorizontalStretchOpts = ScanlineAnimationOpts & {
        peakScalePercent?: number;
    };

    const DEFAULT_HORIZONTAL_STRETCH_OPTS: Required<HorizontalStretchOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        peakScalePercent: 150,
    };

    export const getHorizontalStretchKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalStretchOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STRETCH_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);

        return [
            { offset: 0, transform: "scaleX(1)" },
            { offset: start, transform: "scaleX(1)" },
            { offset: middle, transform: `scaleX(${mergedOpts.peakScalePercent}%)` },
            { offset: end, transform: "scaleX(1)" },
            { offset: 1, transform: "scaleX(1)" },
        ];
    };

    export type HorizontalSnakeOpts = ScanlineAnimationOpts & {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SNAKE_OPTS: Required<HorizontalSnakeOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        shiftPercent: 5,
    };

    export const getHorizontalSnakeKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalSnakeOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SNAKE_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: start, transform: "translateX(0)" },
            { offset: (start + middle) * 0.5, transform: `translateX(${-mergedOpts.shiftPercent}%)` },
            { offset: middle, transform: "translateX(0)" },
            { offset: (end + middle) * 0.5, transform: `translateX(${+mergedOpts.shiftPercent}%)` },
            { offset: end, transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };

    export type HorizontalHueOpts = ScanlineAnimationOpts & {
        filterDir?: "color" | "hue";
    };

    const DEFAULT_HORIZONTAL_HUE_OPTS: Required<HorizontalHueOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        filterDir: "hue",
    };

    export const getHorizontalHueKeyframes = (idx: number, lineCount: number, opts?: HorizontalHueOpts): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_HUE_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);
        const startValue = opts?.filterDir === "color" ? 0 : 180;
        const endValue = opts?.filterDir === "color" ? 180 : 0;

        return [
            { offset: 0, filter: `hue-rotate(${startValue}deg)` },
            { offset: start, filter: `hue-rotate(${startValue}deg)` },
            { offset: middle, filter: `hue-rotate(${endValue}deg)` },
            { offset: end, filter: `hue-rotate(${endValue}deg)` },
            { offset: 1, filter: `hue-rotate(${endValue}deg)` },
        ];
    };

    export type HorizontalGrayscaleOpts = ScanlineAnimationOpts & {
        filterDir?: "color" | "gray";
    };

    const DEFAULT_HORIZONTAL_GRAYSCALE_OPTS: Required<HorizontalGrayscaleOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        filterDir: "gray",
    };

    export const getHorizontalGrayscaleKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalGrayscaleOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_GRAYSCALE_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);
        const startValue = opts?.filterDir === "color" ? 0 : 1;
        const endValue = opts?.filterDir === "color" ? 1 : 0;

        return [
            { offset: 0, filter: `grayscale(${startValue})` },
            { offset: start, filter: `grayscale(${startValue})` },
            { offset: middle, filter: `grayscale(${endValue})` },
            { offset: end, filter: `grayscale(${endValue})` },
            { offset: 1, filter: `grayscale(${endValue})` },
        ];
    };

    export type HorizontalSplitOpts = ScanlineAnimationOpts & {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SPLIT_OPTS: Required<HorizontalSplitOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        shiftPercent: 10,
    };

    export const getHorizontalSplitKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalSplitOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SPLIT_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: start, transform: "translateX(0)" },
            { offset: middle, transform: `translateX(${mergedOpts.shiftPercent * (MathUtils.isEven(idx) ? -1 : 1)}%)` },
            { offset: end, transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };
}
