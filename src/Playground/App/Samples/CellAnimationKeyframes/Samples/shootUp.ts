import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const shootUp: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, translateY: 800, scaleX: 100, scaleY: 100 },
    { at: 0.25, opacity: 100 },
    { at: 0.66, translateY: -400, scaleX: 150, scaleY: 150 },
    { at: 1, translateY: 0, scaleX: 100, scaleY: 100 },
]);
