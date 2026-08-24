import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _stampDefault: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, blur: 24, scaleX: 400, scaleY: 400 },
    { at: 0.4, opacity: 100 },
    { at: 0.7, blur: 0, scaleX: 88, scaleY: 88 },
    { at: 0.85, scaleX: 104, scaleY: 104 },
    { at: 1, scaleX: 100, scaleY: 100 },
]);
