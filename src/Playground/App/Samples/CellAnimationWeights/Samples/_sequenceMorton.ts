import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const _sequenceMorton: WeightFn = (pos, count) => {
    const bits = Math.ceil(Math.log2(Math.max(count.x, count.y, 2)));
    const maxCode = CellAnimationWeightUtils._interleaveBits(count.x - 1, count.y - 1, bits);

    if (maxCode <= 0) return 1;

    return 1 - CellAnimationWeightUtils._interleaveBits(pos.x, pos.y, bits) / maxCode;
};
