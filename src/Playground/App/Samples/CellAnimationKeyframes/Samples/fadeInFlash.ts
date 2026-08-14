import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const fadeInFlash: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, opacity: 0, saturate: 50, brightness: 200 },
    { at: 0.5, opacity: 100, saturate: 50, brightness: 200 },
    { at: 1, saturate: 100, brightness: 100 },
]);
