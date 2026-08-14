import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const spiralQuad: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.spiral(pos, count, origin, 1, 1, 1, 1, 1);
