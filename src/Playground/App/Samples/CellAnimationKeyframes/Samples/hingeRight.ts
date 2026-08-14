import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const hingeRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 1, opacity: 0, rotateY: 90 },
    { at: 0.25, opacity: 100 },
    { at: 0.75, rotateY: -45 },
    { at: 1, originX: 1, rotateY: 0 },
]);
