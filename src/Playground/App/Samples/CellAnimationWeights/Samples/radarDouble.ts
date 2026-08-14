import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const radarDouble: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.radar(pos, count, origin, 2, 0, 1, 0, 1);
