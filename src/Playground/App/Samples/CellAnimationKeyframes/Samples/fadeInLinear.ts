import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const fadeInLinear: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0 },
    { at: 1, opacity: 100 },
]);
