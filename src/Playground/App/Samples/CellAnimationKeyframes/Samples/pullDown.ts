import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const pullDown: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 0, scaleY: 0 },
    { at: 1, originY: 0, scaleY: 100 },
]);
