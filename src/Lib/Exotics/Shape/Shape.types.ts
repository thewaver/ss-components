import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ShapeStrokeGeom = {
    thicknesses: number[];
    offset?: number;
};

export type ShapeProps = AccessorProps<{
    joinRadii?: number[];
    lameExponents?: number[];
    strokeGeom?: ShapeStrokeGeom[];
    computePoints: (size: Size2d) => Point2d[];
    computeStrokeDefs?: (getSize: () => Size2d) => SVGDefs[];
    computeFillDefs?: (getSize: () => Size2d) => SVGDefs[];
    renderChildren: (getSize: () => Size2d, getClipPath: () => string, getClipPoints: () => Point2d[]) => JSX.Element;
}>;
