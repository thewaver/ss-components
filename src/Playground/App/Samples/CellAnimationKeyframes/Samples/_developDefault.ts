import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _developDefault: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, blur: 16, brightness: 260, contrast: 30, grayscale: 100 },
    { at: 0.2, opacity: 100 },
    { at: 0.6, brightness: 90, contrast: 130 },
    { at: 1, blur: 0, brightness: 100, contrast: 100, grayscale: 0 },
]);
