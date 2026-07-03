import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ShapePaths = {
    innerPath: string;
    innerPoints: Point2d[];
    outerPath: string;
    outerPoints: Point2d[];
};

export type ShapeProps = AccessorProps<{
    edgeThicknesses: number[];
    joinRadii?: number[];
    lameExponents?: number[];
    getPoints: (getSize: () => Size2d) => Point2d[];
    getStrokeDefs?: (getSize: () => Size2d) => SVGDefs[];
    getFillDefs?: (getSize: () => Size2d) => SVGDefs[];
    renderInternals?: (getSize: () => Size2d, getPaths: () => ShapePaths) => JSX.Element;
    renderChildren: (getSize: () => Size2d, getPaths: () => ShapePaths) => JSX.Element;
}>;
