import { Point2dUtils } from "@thewaver/ss-utils";

import { CellAnimationUtils } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation.utils";
import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const zigzagRow: WeightFn = (pos, count, origin) => {
    const maxDist = CellAnimationWeightUtils.getMaxDistance(origin, count);
    const dist = Point2dUtils.getDelta(origin, pos);

    return CellAnimationUtils.isEvenRow(dist)
        ? (1 - dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1)
        : (dist.x / maxDist.x + (maxDist.y - dist.y)) / (maxDist.y + 1);
};
