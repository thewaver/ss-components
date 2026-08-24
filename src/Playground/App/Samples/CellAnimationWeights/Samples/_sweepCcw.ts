import { Point2dUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";

const DEGREES_PER_TURN = 360;
const DEGREES_FROM_UP_TO_RIGHT = 270;

export const _sweepCcw: WeightFn = (pos, count, origin) => {
    if (pos.x === origin.x && pos.y === origin.y) return 1;

    const facing = Point2dUtils.getAngle({ x: pos.x - origin.x, y: pos.y - origin.y });
    const bearing = (DEGREES_FROM_UP_TO_RIGHT - facing + DEGREES_PER_TURN) % DEGREES_PER_TURN;

    return 1 - bearing / DEGREES_PER_TURN;
};
