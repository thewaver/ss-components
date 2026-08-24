import { Point2dUtils } from "@thewaver/ss-utils";

import { CellAnimationUtils } from "../../../../../Lib/Exotics/CellAnimation/CellAnimation.utils";
import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const _radialAlternate: WeightFn = (pos, count, origin) => {
    const maxDist = CellAnimationWeightUtils.getMaxDistance(origin, count);
    const dist = Point2dUtils.getDelta(origin, pos);
    const adjustedMaxDist = Point2dUtils.getLength(maxDist) * 2;
    const adjustedDist = Point2dUtils.getLength(dist);

    return CellAnimationUtils.isEvenRing(dist)
        ? 1 - adjustedDist / adjustedMaxDist
        : 1 - (adjustedDist / adjustedMaxDist + 0.5);
};
