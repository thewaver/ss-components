import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";

export const _cubeTop: CellAnimationFn = CellAnimationKeyframeUtils.fromStops([
    { at: 0, originY: 0, opacity: 0, rotateX: -180 },
    { at: 0.2, opacity: 100 },
    { at: 1, originY: 0, rotateX: 0 },
]);
