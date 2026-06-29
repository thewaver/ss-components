import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export const SHAPE_EDGE_THICKNESS_KINDS = ["linear", "constant"] as const;
export type ShapeEdgeThicknessKind = (typeof SHAPE_EDGE_THICKNESS_KINDS)[number];

export const SHAPE_JOIN_KINDS = ["round", "bevel", "scoop"] as const;
export type ShapeJoinKind = (typeof SHAPE_JOIN_KINDS)[number];

export type ShapePaths = {
    innerPath: string;
    innerPoints: Point2d[];
    outerPath: string;
    outerPoints: Point2d[];
};

export type ShapeProps = AccessorProps<{
    edgeThicknesses: number[];
    edgeThicknessKinds?: ShapeEdgeThicknessKind[];
    joinRadii?: number[];
    joinKinds?: ShapeJoinKind[];
    getPoints: (getSize: () => Size2d) => Point2d[];
    getStrokeDefs?: (getSize: () => Size2d) => SVGDefs[];
    getFillDefs?: (getSize: () => Size2d) => SVGDefs[];
    renderChildren: (getSize: () => Size2d, getPaths: () => ShapePaths) => JSX.Element;
}>;
