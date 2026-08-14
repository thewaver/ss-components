import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const rollUpLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, translateX: -400, translateY: 400, rotate: -90 },
    { at: 0.25, opacity: 100 },
    { at: 1, translateX: 0, translateY: 0, rotate: 0 },
]);
