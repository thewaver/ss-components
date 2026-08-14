import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const carouselLeft: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originX: 0, opacity: 0, rotateY: -90, depth: 240 },
    { at: 0.25, opacity: 100 },
    { at: 1, originX: 0, rotateY: 0, depth: 0 },
]);
