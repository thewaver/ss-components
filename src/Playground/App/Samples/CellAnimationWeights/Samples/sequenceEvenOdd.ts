import { MathUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const sequenceEvenOdd: WeightFn = (pos, count) => {
    const total = count.x * count.y;
    const idx = CellAnimationWeightUtils.getFlatIndex(pos, count);
    const evenCount = Math.ceil(total * 0.5);

    return CellAnimationWeightUtils.fromOrderedIndex(
        MathUtils.isEven(idx) ? idx * 0.5 : evenCount + Math.floor(idx * 0.5),
        total,
    );
};
