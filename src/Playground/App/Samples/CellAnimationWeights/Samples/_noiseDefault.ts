import type { WeightFn } from "../CellAnimationWeights.types";
import { CellAnimationWeightUtils } from "../CellAnimationWeights.utils";

export const _noiseDefault: WeightFn = (pos) => CellAnimationWeightUtils._hashToUnit(pos.x, pos.y);
