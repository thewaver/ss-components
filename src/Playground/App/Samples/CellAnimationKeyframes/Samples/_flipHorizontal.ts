import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _flipHorizontal: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, rotateY: 180 },
    { at: 0.2, opacity: 100 },
    { at: 1, rotateY: 0 },
]);
