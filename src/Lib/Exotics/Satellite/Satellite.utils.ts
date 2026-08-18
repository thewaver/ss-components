import type { Point2d, Rect, Size2d } from "@thewaver/ss-utils";

import type { AnchorPlacement } from "../../Abstracts/Anchor/Anchor.types";
import { AnchorUtils } from "../../Abstracts/Anchor/Anchor.utils";
import type { SatelliteLayout } from "./Satellite.types";

export namespace SatelliteUtils {
    export const computeLayout = (
        subjectSize: Size2d,
        satelliteSize: Size2d,
        placement: AnchorPlacement,
        offset: Point2d,
    ): SatelliteLayout => {
        const subjectRect: Rect = { x: 0, y: 0, width: subjectSize.width, height: subjectSize.height };
        const shift: Point2d = {
            x: AnchorUtils.getHPlacementShift(placement.x, subjectRect, satelliteSize) + offset.x,
            y: AnchorUtils.getVPlacementShift(placement.y, subjectRect, satelliteSize) + offset.y,
        };

        return {
            padding: {
                paddingLeft: Math.max(0, -shift.x),
                paddingTop: Math.max(0, -shift.y),
                paddingRight: Math.max(0, shift.x + satelliteSize.width - subjectSize.width),
                paddingBottom: Math.max(0, shift.y + satelliteSize.height - subjectSize.height),
            },
            satelliteOffset: {
                x: Math.max(0, shift.x),
                y: Math.max(0, shift.y),
            },
        };
    };
}
