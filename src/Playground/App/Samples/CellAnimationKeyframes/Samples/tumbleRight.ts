import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const tumbleRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, translateX: -200, translateY: 0, rotate: -180 },
    { at: 0.25, opacity: 100, translateX: -150, translateY: 50, rotate: -135 },
    { at: 0.5, translateX: -100, translateY: 0, rotate: -90 },
    { at: 0.75, translateX: -50, translateY: 25, rotate: -45 },
    { at: 1, translateX: 0, translateY: 0, rotate: 0 },
]);
