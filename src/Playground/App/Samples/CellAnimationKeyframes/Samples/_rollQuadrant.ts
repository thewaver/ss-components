import type { CellAnimationFn } from "../CellAnimationKeyframes.types";
import { CellAnimationKeyframeUtils } from "../CellAnimationKeyframes.utils";
import { rollDownLeft } from "./rollDownLeft";
import { rollDownRight } from "./rollDownRight";
import { rollUpLeft } from "./rollUpLeft";
import { rollUpRight } from "./rollUpRight";
import { zoomIn } from "./zoomIn";

export const _rollQuadrant: CellAnimationFn = CellAnimationKeyframeUtils._fromZones(
    [
        { zone: "quadrant1", animation: rollUpRight },
        { zone: "quadrant2", animation: rollUpLeft },
        { zone: "quadrant3", animation: rollDownLeft },
        { zone: "quadrant4", animation: rollDownRight },
        { zone: "axis1", animation: rollUpRight },
        { zone: "axis3", animation: rollDownRight },
        { zone: "axis4", animation: rollDownLeft },
        { zone: "axis2", animation: rollUpLeft },
    ],
    zoomIn,
);
