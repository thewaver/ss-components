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

    export type HorizontalSwingOpts = ScanlineAnimationOpts & {
        shiftPercent?: number;
    };

    const DEFAULT_HORIZONTAL_SWING_OPTS: Required<HorizontalSwingOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        shiftPercent: 20,
    };

    export const getHorizontalSwingKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalSwingOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SWING_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: start, transform: "translateX(0)" },
            { offset: (start + middle) / 2, transform: `translateX(${-mergedOpts.shiftPercent}%)` },
            { offset: middle, transform: "translateX(0)" },
            { offset: (end + middle) / 2, transform: `translateX(${+mergedOpts.shiftPercent}%)` },
            { offset: end, transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
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
        const startScale = opts?.filterDir === "color" ? 0 : 1;
        const endScale = opts?.filterDir === "color" ? 1 : 0;

        return [
            { offset: 0, filter: `grayscale(${startScale})` },
            { offset: start, filter: `grayscale(${startScale})` },
            { offset: middle, filter: `grayscale(${endScale})` },
            { offset: end, filter: `grayscale(${endScale})` },
            { offset: 1, filter: `grayscale(${endScale})` },
        ];
    };

    export type HorizontalStackOpts = ScanlineAnimationOpts & {
        stackDir?: "in" | "out";
    };

    const DEFAULT_HORIZONTAL_STACK_OPTS: Required<HorizontalStackOpts> = {
        ...DEFAULT_SCANLINE_ANIMATION_OPTS,
        stackDir: "in",
    };

    export const getHorizontalStackKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalStackOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STACK_OPTS, ...opts };
        const { end, middle, start } = getBreakpoints(idx, lineCount, mergedOpts);
        const startOpacity = opts?.stackDir === "in" ? 0 : 1;
        const endOpacity = opts?.stackDir === "in" ? 1 : 0;
        const dirMult = (opts?.dir === "top" ? 1 : -1) * (opts?.stackDir === "in" ? 1 : -1);

        return [
            { offset: 0, transform: `translateY(${(1 - startOpacity) * dirMult * 100}%)`, opacity: startOpacity },
            { offset: start, transform: `translateY(${(1 - startOpacity) * dirMult * 100}%)`, opacity: startOpacity },
            { offset: middle, transform: `translateY(${(1 - endOpacity) * dirMult * 100}%)`, opacity: endOpacity },
            { offset: end, transform: `translateY(${(1 - endOpacity) * dirMult * 100}%)`, opacity: endOpacity },
            { offset: 1, transform: `translateY(${(1 - endOpacity) * dirMult * 100}%)`, opacity: endOpacity },
        ];
    };
}
