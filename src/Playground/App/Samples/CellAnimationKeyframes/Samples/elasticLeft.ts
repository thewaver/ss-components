import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const elasticLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 1, opacity: 0, scaleX: 100, translateX: -400 },
    { at: 0.25, opacity: 100 },
    { at: 0.5, scaleX: 400, translateX: 0 },
    { at: 1, originX: 1, scaleX: 100, translateX: 0 },
]);
