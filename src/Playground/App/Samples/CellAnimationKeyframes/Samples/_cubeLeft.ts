import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _cubeLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 0, opacity: 0, rotateY: 180 },
    { at: 0.2, opacity: 100 },
    { at: 1, originX: 0, rotateY: 0 },
]);
