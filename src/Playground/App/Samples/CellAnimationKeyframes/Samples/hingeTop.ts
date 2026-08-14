import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const hingeTop: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 0, opacity: 0, rotateX: 90 },
    { at: 0.25, opacity: 100 },
    { at: 0.75, rotateX: -45 },
    { at: 1, originY: 0, rotateX: 0 },
]);
