import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _swingDefault: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 0, opacity: 0, rotate: -75 },
    { at: 0.2, opacity: 100 },
    { at: 0.4, rotate: 40 },
    { at: 0.6, rotate: -20 },
    { at: 0.8, rotate: 8 },
    { at: 0.9, rotate: -3 },
    { at: 1, originY: 0, rotate: 0 },
]);
