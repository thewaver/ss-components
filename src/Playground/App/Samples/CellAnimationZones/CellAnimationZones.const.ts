import { type Point2d, Point2dUtils } from "@thewaver/ss-utils";

import type { CellAnimationEvaluationDefs } from "../../../../Lib";
import { CellAnimationUtils } from "../../../../Lib/Exotics/CellAnimation/CellAnimation.utils";

export namespace CellAnimationZones {
    export const ZONE_TYPES = [
        "all",
        "top",
        "left",
        "bottom",
        "right",
        "quadrant1",
        "quadrant2",
        "quadrant3",
        "quadrant4",
        "axisX",
        "axisY",
        "axis1",
        "axis2",
        "axis3",
        "axis4",
        "origin",
        "evenRows",
        "oddRows",
        "evenColumns",
        "oddColumns",
        "evenRings",
        "oddRings",
        "evenCheckeredCells",
        "oddCheckeredCells",
        "lighterHalf",
        "heavierHalf",
    ] as const;

    export type ZoneType = (typeof ZONE_TYPES)[number];

    export type ZoneFn = (defs: CellAnimationEvaluationDefs & { origin: Point2d }) => boolean;

    const zoneRegistry: Record<ZoneType, ZoneFn> = {
        all: () => true,
        top: ({ pos, origin }) => pos.y < origin.y,
        left: ({ pos, origin }) => pos.x < origin.x,
        bottom: ({ pos, origin }) => pos.y > origin.y,
        right: ({ pos, origin }) => pos.x > origin.x,
        quadrant1: ({ pos, origin }) => pos.x > origin.x && pos.y < origin.y,
        quadrant2: ({ pos, origin }) => pos.x < origin.x && pos.y < origin.y,
        quadrant3: ({ pos, origin }) => pos.x < origin.x && pos.y > origin.y,
        quadrant4: ({ pos, origin }) => pos.x > origin.x && pos.y > origin.y,
        axisX: ({ pos, origin }) => pos.y === origin.y,
        axisY: ({ pos, origin }) => pos.x === origin.x,
        axis1: ({ pos, origin }) => pos.x === origin.x && pos.y < origin.y,
        axis2: ({ pos, origin }) => pos.x < origin.x && pos.y === origin.y,
        axis3: ({ pos, origin }) => pos.x > origin.x && pos.y === origin.y,
        axis4: ({ pos, origin }) => pos.x === origin.x && pos.y > origin.y,
        origin: ({ pos, origin }) => pos.x === origin.x && pos.y === origin.y,
        evenRows: ({ pos, origin }) => CellAnimationUtils.isEvenRow(Point2dUtils.getDelta(origin, pos)),
        oddRows: ({ pos, origin }) => !CellAnimationUtils.isEvenRow(Point2dUtils.getDelta(origin, pos)),
        evenColumns: ({ pos, origin }) => CellAnimationUtils.isEvenColumn(Point2dUtils.getDelta(origin, pos)),
        oddColumns: ({ pos, origin }) => !CellAnimationUtils.isEvenColumn(Point2dUtils.getDelta(origin, pos)),
        evenRings: ({ pos, origin }) => CellAnimationUtils.isEvenRing(Point2dUtils.getDelta(origin, pos)),
        oddRings: ({ pos, origin }) => !CellAnimationUtils.isEvenRing(Point2dUtils.getDelta(origin, pos)),
        evenCheckeredCells: ({ pos, origin }) => CellAnimationUtils.isEvenCheckered(Point2dUtils.getDelta(origin, pos)),
        oddCheckeredCells: ({ pos, origin }) => !CellAnimationUtils.isEvenCheckered(Point2dUtils.getDelta(origin, pos)),
        lighterHalf: ({ weight }) => weight < 0.5,
        heavierHalf: ({ weight }) => weight >= 0.5,
    };

    export const isInZone = (type: ZoneType, defs: CellAnimationEvaluationDefs & { origin: Point2d }) =>
        zoneRegistry[type](defs);
}
