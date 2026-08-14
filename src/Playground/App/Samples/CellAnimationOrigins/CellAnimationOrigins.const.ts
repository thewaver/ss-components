import type { Point2d } from "@thewaver/ss-utils";

export namespace CellAnimationOrigins {
    export const ORIGIN_TYPES = [
        "center",
        "top",
        "topRight",
        "right",
        "bottomRight",
        "bottom",
        "bottomLeft",
        "left",
        "topLeft",
    ] as const;

    export type OriginType = (typeof ORIGIN_TYPES)[number];

    const originRegistry: Record<OriginType, (count: Point2d) => Point2d> = {
        center: (count) => ({ x: (count.x - 1) * 0.5, y: (count.y - 1) * 0.5 }),
        top: (count) => ({ x: (count.x - 1) * 0.5, y: 0 }),
        topRight: (count) => ({ x: count.x - 1, y: 0 }),
        right: (count) => ({ x: count.x - 1, y: (count.y - 1) * 0.5 }),
        bottomRight: (count) => ({ x: count.x - 1, y: count.y - 1 }),
        bottom: (count) => ({ x: (count.x - 1) * 0.5, y: count.y - 1 }),
        bottomLeft: (count) => ({ x: 0, y: count.y - 1 }),
        left: (count) => ({ x: 0, y: (count.y - 1) * 0.5 }),
        topLeft: () => ({ x: 0, y: 0 }),
    };

    export const computeOrigin = (type: OriginType, count: Point2d) => originRegistry[type](count);
}
