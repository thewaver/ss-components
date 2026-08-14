import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const pullRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 0, scaleX: 0 },
    { at: 1, originX: 0, scaleX: 100 },
]);
