import { MathUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const sequenceInterleaved: WeightFn = (pos, count) => {
    const total = count.x * count.y;
    const idx = CellAnimationWeightUtils.getFlatIndex(pos, count);
    const pair = Math.floor(idx * 0.5);

    return CellAnimationWeightUtils.fromOrderedIndex(MathUtils.isEven(idx) ? pair : total - 1 - pair, total);
};
