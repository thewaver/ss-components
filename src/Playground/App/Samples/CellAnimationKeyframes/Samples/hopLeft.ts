import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const hopLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, translateX: 400, translateY: 0, scaleX: 20, scaleY: 20 },
    { at: 0.25, opacity: 100, translateX: 300, translateY: -200, scaleX: 40, scaleY: 40 },
    { at: 0.5, translateX: 200, translateY: 0, scaleX: 60, scaleY: 60 },
    { at: 0.75, translateX: 100, translateY: -100, scaleX: 80, scaleY: 80 },
    { at: 1, translateX: 0, translateY: 0, scaleX: 100, scaleY: 100 },
]);
