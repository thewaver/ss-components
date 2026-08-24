import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";
import { hingeBottom } from "./hingeBottom";
import { hingeLeft } from "./hingeLeft";
import { hingeRight } from "./hingeRight";
import { hingeTop } from "./hingeTop";
import { zoomIn } from "./zoomIn";

export const _hingeQuadrant: CellAnimationFn = CellAnimationKeyframeUtils._fromZones(
    [
        { zone: "top", animation: hingeTop },
        { zone: "bottom", animation: hingeBottom },
        { zone: "left", animation: hingeLeft },
        { zone: "right", animation: hingeRight },
    ],
    zoomIn,
);
