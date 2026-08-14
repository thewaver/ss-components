import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const elasticRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 0, opacity: 0, scaleX: 100, translateX: 400 },
    { at: 0.25, opacity: 100 },
    { at: 0.5, scaleX: 400, translateX: 0 },
    { at: 1, originX: 0, scaleX: 100, translateX: 0 },
]);
