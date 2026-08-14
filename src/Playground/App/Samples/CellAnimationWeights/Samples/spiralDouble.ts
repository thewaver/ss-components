import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const spiralDouble: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.spiral(pos, count, origin, 2, 1, 3, 1, 3);
