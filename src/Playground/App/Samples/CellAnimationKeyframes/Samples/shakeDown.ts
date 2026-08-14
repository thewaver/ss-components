import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const shakeDown: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, translateX: -100, translateY: -800, rotate: 20 },
    { at: 0.25, opacity: 100, translateX: 100, translateY: -600, rotate: -20 },
    { at: 0.5, translateX: -50, translateY: -400, rotate: 10 },
    { at: 0.75, translateX: 50, translateY: -200, rotate: -10 },
    { at: 1, translateX: 0, translateY: 0, rotate: 0 },
]);
