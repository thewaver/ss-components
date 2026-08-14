import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const pullUp: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 1, scaleY: 0 },
    { at: 1, originY: 1, scaleY: 100 },
]);
