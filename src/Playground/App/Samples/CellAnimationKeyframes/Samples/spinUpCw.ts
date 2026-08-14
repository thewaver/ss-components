import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const spinUpCw: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 4, originY: 4, opacity: 0, rotate: -360 },
    { at: 0.25, opacity: 100 },
    { at: 1, originX: 0.5, originY: 0.5, rotate: 0 },
]);
