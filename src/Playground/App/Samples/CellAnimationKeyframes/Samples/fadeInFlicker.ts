import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const fadeInFlicker: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0 },
    { at: 0.1, opacity: 100 },
    { at: 0.2, opacity: 100 },
    { at: 0.25, opacity: 50 },
    { at: 0.3, opacity: 100 },
    { at: 0.4, opacity: 100 },
    { at: 0.45, opacity: 75 },
    { at: 0.5, opacity: 100 },
    { at: 0.6, opacity: 100 },
    { at: 0.65, opacity: 50 },
    { at: 0.7, opacity: 100 },
    { at: 0.8, opacity: 100 },
    { at: 0.85, opacity: 75 },
    { at: 0.9, opacity: 100 },
    { at: 1, opacity: 100 },
]);
