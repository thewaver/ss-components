import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const pullLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 1, scaleX: 0 },
    { at: 1, originX: 1, scaleX: 100 },
]);
