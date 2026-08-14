import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const radarQuad: WeightFn = (pos, count, origin) =>
    CellAnimationWeightUtils.radar(pos, count, origin, 1, 0, 0, 0, 0);
