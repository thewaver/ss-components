import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const popCenter: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, scaleX: 0, scaleY: 0 },
    { at: 0.5, scaleX: 100, scaleY: 100, brightness: 80 },
    { at: 0.75, scaleX: 150, scaleY: 150 },
    { at: 1, scaleX: 100, scaleY: 100 },
]);
