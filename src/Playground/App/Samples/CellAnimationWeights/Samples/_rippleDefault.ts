import { Point2dUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";

const RIPPLE_PERIOD_CELLS = 4;

export const _rippleDefault: WeightFn = (pos, count, origin) => {
    const spread = Point2dUtils.getLength(Point2dUtils.getDelta(origin, pos));

    return (Math.cos((spread / RIPPLE_PERIOD_CELLS) * Math.PI * 2) + 1) * 0.5;
};
