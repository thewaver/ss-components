import { MathUtils } from "@thewaver/ss-utils";

import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

const CLUSTER_SIZE = 4;

const fade = (ratio: number) => ratio * ratio * (3 - 2 * ratio);

export const _clusterNoise: WeightFn = (pos) => {
    const cluster = { x: pos.x / CLUSTER_SIZE, y: pos.y / CLUSTER_SIZE };
    const corner = { x: Math.floor(cluster.x), y: Math.floor(cluster.y) };
    const withinX = fade(cluster.x - corner.x);
    const withinY = fade(cluster.y - corner.y);
    const topLeft = CellAnimationWeightUtils._hashToUnit(corner.x, corner.y);
    const topRight = CellAnimationWeightUtils._hashToUnit(corner.x + 1, corner.y);
    const bottomLeft = CellAnimationWeightUtils._hashToUnit(corner.x, corner.y + 1);
    const bottomRight = CellAnimationWeightUtils._hashToUnit(corner.x + 1, corner.y + 1);

    return MathUtils.lerp(
        MathUtils.lerp(topLeft, topRight, withinX),
        MathUtils.lerp(bottomLeft, bottomRight, withinX),
        withinY,
    );
};
