import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";
import { pullDown } from "./pullDown";
import { pullLeft } from "./pullLeft";
import { pullRight } from "./pullRight";
import { pullUp } from "./pullUp";
import { zoomIn } from "./zoomIn";

export const _pullQuadrant: CellAnimationFn = CellAnimationKeyframeUtils._fromZones(
    [
        { zone: "top", animation: pullUp },
        { zone: "bottom", animation: pullDown },
        { zone: "left", animation: pullLeft },
        { zone: "right", animation: pullRight },
    ],
    zoomIn,
);
