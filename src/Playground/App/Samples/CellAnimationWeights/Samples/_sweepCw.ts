import { Point2dUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";

const DEGREES_PER_TURN = 360;
const DEGREES_FROM_RIGHT_TO_UP = 90;

export const _sweepCw: WeightFn = (pos, count, origin) => {
    if (pos.x === origin.x && pos.y === origin.y) return 1;

    const facing = Point2dUtils.getAngle({ x: pos.x - origin.x, y: pos.y - origin.y });
    const bearing = (facing + DEGREES_FROM_RIGHT_TO_UP + DEGREES_PER_TURN) % DEGREES_PER_TURN;

    return 1 - bearing / DEGREES_PER_TURN;
};
