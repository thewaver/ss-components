import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const popTopRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 1, originY: 0, scaleX: 0, scaleY: 0 },
    { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
    { at: 0.75, scaleX: 150, scaleY: 150 },
    { at: 1, originX: 1, originY: 0, scaleX: 100, scaleY: 100 },
]);
