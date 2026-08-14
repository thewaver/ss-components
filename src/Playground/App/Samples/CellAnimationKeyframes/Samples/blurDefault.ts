import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const blurDefault: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, blur: 20 },
    { at: 0.5, opacity: 100 },
    { at: 1, blur: 0 },
]);
