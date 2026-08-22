import type { Size2d } from "@thewaver/ss-utils";

import type { WheelAxis } from "./Wheel.types";

const MIN_DRUM_WEDGE_COUNT = 2;
const MIN_BACKED_WEDGE_COUNT = 3;

export const DRUM_PERSPECTIVE_PX = 1000;

export namespace WheelUtils {
    export const getWedgeExtent = (wedgeSize: Size2d, axis: WheelAxis) =>
        axis === "row" ? wedgeSize.width : wedgeSize.height;

    export const getHasWedgeBacks = (wedgeCount: number) => wedgeCount >= MIN_BACKED_WEDGE_COUNT;

    export const getApothem = (wedgeExtent: number, wedgeCount: number) => {
        if (wedgeCount < MIN_DRUM_WEDGE_COUNT) return 0;

        const halfAngleTangent = Math.tan(Math.PI / wedgeCount);

        if (!Number.isFinite(halfAngleTangent) || halfAngleTangent <= 0) return 0;

        return Math.round(wedgeExtent / 2 / halfAngleTangent);
    };

    export const getCircumdiameter = (wedgeExtent: number, wedgeCount: number) => {
        if (wedgeCount < MIN_DRUM_WEDGE_COUNT) return wedgeExtent;

        return Math.round(wedgeExtent / Math.sin(Math.PI / wedgeCount));
    };

    export const getGirth = (wedgeExtent: number, wedgeCount: number) => {
        const radius = getCircumdiameter(wedgeExtent, wedgeCount) * 0.5;
        const eyeDistance = DRUM_PERSPECTIVE_PX + getApothem(wedgeExtent, wedgeCount);
        const tangentDistanceSquared = eyeDistance * eyeDistance - radius * radius;

        if (tangentDistanceSquared <= 0) return radius * 2;

        return (2 * DRUM_PERSPECTIVE_PX * radius) / Math.sqrt(tangentDistanceSquared);
    };
}
