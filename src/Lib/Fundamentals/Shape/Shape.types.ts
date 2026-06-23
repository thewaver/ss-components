import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { AccessorProps } from "../../Utils/typeUtils";

export const SHAPE_EDGE_THICKNESS_KINDS = ["progressive", "constant"] as const;
export type ShapeEdgeThicknessKind = (typeof SHAPE_EDGE_THICKNESS_KINDS)[number];

export const SHAPE_JOIN_KINDS = ["round", "bevel", "scoop"] as const;
export type ShapeJoinKind = (typeof SHAPE_JOIN_KINDS)[number];

export type ShapeProps = AccessorProps<
    Size2d & {
        edgeThicknesses: number[];
        edgeThicknessKinds?: ShapeEdgeThicknessKind[];
        joinRadii?: number[];
        joinKinds?: ShapeJoinKind[];
        getPoints: (size: Size2d) => Point2d[];
    }
>;
