import { MathUtils } from "@thewaver/ss-utils";

const RATIO_MIN = 0;
const RATIO_MAX = 1;

const computeThumbStart = (progressRatio: number, thumbRatio: number) => progressRatio * (RATIO_MAX - thumbRatio);

export namespace SlideButtonUtils {
    export const computeWidthRatio = (trackWidth: number, widthPx: number) =>
        trackWidth > 0 ? Math.min(widthPx / trackWidth, RATIO_MAX) : RATIO_MAX;

    export const computeGrabRatio = (pointerRatio: number, progressRatio: number, thumbRatio: number) =>
        pointerRatio - computeThumbStart(progressRatio, thumbRatio);

    export const computeIsOnThumb = (pointerRatio: number, progressRatio: number, thumbRatio: number) => {
        const grabRatio = computeGrabRatio(pointerRatio, progressRatio, thumbRatio);

        return grabRatio >= RATIO_MIN && grabRatio <= thumbRatio;
    };

    export const computeProgressRatio = (pointerRatio: number, grabRatio: number, thumbRatio: number) => {
        const travelRatio = RATIO_MAX - thumbRatio;

        if (travelRatio <= 0) return RATIO_MIN;

        return MathUtils.clamp01((pointerRatio - grabRatio) / travelRatio);
    };

    export const computeHoldRatio = (elapsedMs: number, durationMs: number) => {
        if (durationMs <= 0) return RATIO_MAX;

        return MathUtils.clamp01(elapsedMs / durationMs);
    };
}
