export namespace ScanlineAnimationUtils {
    export const getHorizontalShiftKeyframes = (
        shiftPercent: number,
        breakpoints: [number, number, number, number],
    ): Keyframe[] => {
        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: breakpoints[0], transform: "translateX(0)" },
            { offset: breakpoints[1], transform: `translateX(${shiftPercent}%)` },
            { offset: breakpoints[2], transform: `translateX(${shiftPercent}%)` },
            { offset: breakpoints[3], transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };

    export type HorizontalStretchOpts = {
        dir?: "top" | "bottom";
        peakScalePercent?: number;
        smoothness?: number;
    };

    const DEFAULT_HORIZONTAL_STRETCH_OPTS: Required<HorizontalStretchOpts> = {
        dir: "top",
        peakScalePercent: 150,
        smoothness: 0.1,
    };

    export const getHorizontalStretchKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalStretchOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_STRETCH_OPTS, ...opts };
        const dirIdx = mergedOpts.dir === "bottom" ? lineCount - 1 - idx : idx;
        const middle = (dirIdx + 0.5) / lineCount;
        const start = Math.max(0, middle - mergedOpts.smoothness * 0.5);
        const end = Math.min(1, middle + mergedOpts.smoothness * 0.5);

        return [
            { offset: 0, transform: "scaleX(1)" },
            { offset: start, transform: "scaleX(1)" },
            { offset: middle, transform: `scaleX(${mergedOpts.peakScalePercent}%)` },
            { offset: end, transform: "scaleX(1)" },
            { offset: 1, transform: "scaleX(1)" },
        ];
    };

    export type HorizontalSwingOpts = {
        dir?: "top" | "bottom";
        shiftPercent?: number;
        smoothness?: number;
    };

    const DEFAULT_HORIZONTAL_SWING_OPTS: Required<HorizontalSwingOpts> = {
        dir: "top",
        shiftPercent: 20,
        smoothness: 0.1,
    };

    export const getHorizontalSwingKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalSwingOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_SWING_OPTS, ...opts };
        const dirIdx = mergedOpts.dir === "bottom" ? lineCount - 1 - idx : idx;
        const middle = (dirIdx + 0.5) / lineCount;
        const breakpoints = [
            Math.max(0, middle - mergedOpts.smoothness * 0.5),
            Math.max(0, middle - mergedOpts.smoothness * 0.25),
            Math.min(1, middle + mergedOpts.smoothness * 0.25),
            Math.min(1, middle + mergedOpts.smoothness * 0.5),
        ];

        return [
            { offset: 0, transform: "translateX(0)" },
            { offset: breakpoints[0], transform: "translateX(0)" },
            { offset: breakpoints[1], transform: `translateX(${-mergedOpts.shiftPercent}%)` },
            { offset: middle, transform: "translateX(0)" },
            { offset: breakpoints[2], transform: `translateX(${+mergedOpts.shiftPercent}%)` },
            { offset: breakpoints[3], transform: "translateX(0)" },
            { offset: 1, transform: "translateX(0)" },
        ];
    };
}
