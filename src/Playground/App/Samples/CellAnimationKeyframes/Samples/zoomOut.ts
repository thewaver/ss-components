import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const zoomOut: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, scaleX: 400, scaleY: 400, brightness: 80 },
    { at: 0.25, opacity: 100 },
    { at: 1, scaleX: 100, scaleY: 100, brightness: 100 },
]);
