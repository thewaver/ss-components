import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const encircleCw: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 0, originY: 0, scaleX: 0, scaleY: 0 },
    { at: 0.33, originX: 1, originY: 0 },
    { at: 0.66, originX: 1, originY: 1 },
    { at: 1, originX: 0, originY: 1, scaleX: 100, scaleY: 100 },
]);
