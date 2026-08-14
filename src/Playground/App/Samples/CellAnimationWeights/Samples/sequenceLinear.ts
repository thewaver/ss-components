import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const sequenceLinear: WeightFn = (pos, count) =>
    CellAnimationWeightUtils.fromOrderedIndex(CellAnimationWeightUtils.getFlatIndex(pos, count), count.x * count.y);
