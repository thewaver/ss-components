import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const radarSingle: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.radar(pos, count, origin, 4, 0, 1, 2, 3);
