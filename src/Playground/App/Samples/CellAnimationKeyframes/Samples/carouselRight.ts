import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const carouselRight: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 1, opacity: 0, rotateY: 90, depth: 240 },
    { at: 0.25, opacity: 100 },
    { at: 1, originX: 1, rotateY: 0, depth: 0 },
]);
