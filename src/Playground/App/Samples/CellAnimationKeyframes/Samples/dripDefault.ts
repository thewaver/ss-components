import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const dripDefault: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 1, opacity: 0, scaleY: 400, translateY: -1600 },
    { at: 0.25, opacity: 100 },
    { at: 0.75, scaleY: 0, translateY: 0 },
    { at: 1, originY: 1, scaleY: 100, translateY: 0 },
]);
