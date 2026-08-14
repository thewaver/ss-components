import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const skewCcw: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, skewX: 45, skewY: 45 },
    { at: 1, skewX: 0, skewY: 0 },
]);
