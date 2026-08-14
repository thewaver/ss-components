import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const spiralSingle: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.spiral(pos, count, origin, 4, 1, 3, 5, 7);
