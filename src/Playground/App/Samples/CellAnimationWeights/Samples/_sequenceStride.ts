import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

const GOLDEN_RATIO = 0.6180339887498949;

export const _sequenceStride: WeightFn = (pos, count) => {
    const total = count.x * count.y;

    if (total <= 1) return 1;

    let stride = Math.max(Math.round(total * GOLDEN_RATIO), 1);

    while (stride > 1 && CellAnimationWeightUtils._greatestCommonDivisor(stride, total) !== 1) {
        stride--;
    }

    return CellAnimationWeightUtils.fromOrderedIndex(
        (CellAnimationWeightUtils.getFlatIndex(pos, count) * stride) % total,
        total,
    );
};
