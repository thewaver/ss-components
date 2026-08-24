import { MathUtils, Point2dUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const _frameConvergent: WeightFn = (pos, count) => {
    const nearest = Point2dUtils.getNearestBound(pos, CellAnimationWeightUtils.toBounds(count));
    const ring = Math.min(nearest.x, nearest.y);
    const maxRing = Math.max(
        Math.floor((Math.min(count.x, count.y) - 1) / 2),
        CellAnimationWeightUtils.MIN_MAX_DISTANCE,
    );

    return MathUtils.isEven(ring) ? 1 - ring / (maxRing * 2) : ring / (maxRing * 2);
};
