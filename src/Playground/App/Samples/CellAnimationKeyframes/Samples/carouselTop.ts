import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const carouselTop: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 0, opacity: 0, rotateX: 90, depth: 240 },
    { at: 0.25, opacity: 100 },
    { at: 1, originY: 0, rotateX: 0, depth: 0 },
]);
