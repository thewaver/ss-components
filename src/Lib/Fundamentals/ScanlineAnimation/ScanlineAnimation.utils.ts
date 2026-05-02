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

    export type HorizontalPulseOpts = {
        dir?: "top" | "bottom";
        peakScalePercent?: number;
        smoothness?: number;
    };

    const DEFAULT_HORIZONTAL_PULSE_OPTS: Required<HorizontalPulseOpts> = {
        dir: "top",
        peakScalePercent: 150,
        smoothness: 0.1,
    };

    export const getHorizontalPulseKeyframes = (
        idx: number,
        lineCount: number,
        opts?: HorizontalPulseOpts,
    ): Keyframe[] => {
        const mergedOpts = { ...DEFAULT_HORIZONTAL_PULSE_OPTS, ...opts };
        const dirIdx = mergedOpts.dir === "bottom" ? lineCount - 1 - idx : idx;
        const middle = (dirIdx + 0.5) / lineCount;
        const start = Math.max(0, middle - mergedOpts.smoothness / 2);
        const end = Math.min(1, middle + mergedOpts.smoothness / 2);

        return [
            { offset: 0, transform: "scaleX(1)" },
            { offset: start, transform: "scaleX(1)" },
            { offset: middle, transform: `scaleX(${mergedOpts.peakScalePercent}%)` },
            { offset: end, transform: "scaleX(1)" },
            { offset: 1, transform: "scaleX(1)" },
        ];
    };
}
