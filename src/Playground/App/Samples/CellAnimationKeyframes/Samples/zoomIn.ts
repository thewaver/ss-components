import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const zoomIn: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, scaleX: 0, scaleY: 0 },
    { at: 1, scaleX: 100, scaleY: 100 },
]);
