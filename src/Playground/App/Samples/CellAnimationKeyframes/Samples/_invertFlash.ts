import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _invertFlash: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, invert: 100 },
    { at: 0.15, opacity: 100, invert: 100 },
    { at: 0.35, invert: 0 },
    { at: 0.5, invert: 100 },
    { at: 0.65, invert: 0 },
    { at: 0.8, invert: 70 },
    { at: 1, invert: 0 },
]);
