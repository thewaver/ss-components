import { Point2dUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const lineRow: WeightFn = (pos, count, origin) =>
    1 - Point2dUtils.getDelta(origin, pos).y / CellAnimationWeightUtils.getMaxDistance(origin, count).y;
