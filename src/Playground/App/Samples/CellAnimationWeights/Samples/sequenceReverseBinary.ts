import { MathUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const sequenceReverseBinary: WeightFn = (pos, count) => {
    const total = count.x * count.y;

    if (total <= 1) return 1;

    const bits = Math.ceil(Math.log2(total));

    return CellAnimationWeightUtils.fromOrderedIndex(
        MathUtils.reverseBits(CellAnimationWeightUtils.getFlatIndex(pos, count), bits) % total,
        total,
    );
};
