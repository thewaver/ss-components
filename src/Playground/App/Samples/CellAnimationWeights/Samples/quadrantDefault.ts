import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const quadrantDefault: WeightFn = (pos, count, origin) => {
    const maxDist = CellAnimationWeightUtils.getMaxDistance(origin, count);
    const signedDist = { x: origin.x - pos.x, y: origin.y - pos.y };

    return (1 - (signedDist.x * signedDist.y) / (maxDist.x * maxDist.y)) * 0.5;
};
