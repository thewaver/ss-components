import { Point2dUtils } from "@thewaver/ss-utils";

import { CellAnimationUtils } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation.utils";
import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const circularConvergent: WeightFn = (pos, count, origin) => {
    const maxDist = CellAnimationWeightUtils.getMaxDistance(origin, count);
    const dist = Point2dUtils.getDelta(origin, pos);
    const adjustedMaxDist = Math.max(maxDist.x, maxDist.y) * 2;
    const adjustedDist = (dist.x + dist.y) * 0.5;

    return CellAnimationUtils.isEvenRing(dist)
        ? 1 - adjustedDist / adjustedMaxDist
        : 1 - (adjustedMaxDist + 0.5 - adjustedDist) / adjustedMaxDist;
};
