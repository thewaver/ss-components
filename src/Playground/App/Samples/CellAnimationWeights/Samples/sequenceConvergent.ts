import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const sequenceConvergent: WeightFn = (pos, count) => {
    const total = count.x * count.y;
    const idx = CellAnimationWeightUtils.getFlatIndex(pos, count);
    const progress = total <= 1 ? 0.5 : idx / (total - 1);
    const edgeDistance = Math.abs(progress - 0.5) * 2;

    return CellAnimationWeightUtils.fromOrderedIndex(Math.round((1 - edgeDistance) * (total - 1)), total);
};
