import type { JSX } from "solid-js";

import type { Point2d, Size2d } from "@thewaver/ss-utils";

import type { SVGDefs } from "../../Abstracts/SVG/Defs/SVGDefs.types";
import type { AccessorProps } from "../../Utils/typeUtils";

export type ShapeProps = AccessorProps<{
    joinRadii?: number[];
    lameExponents?: number[];
    getPoints: (getSize: () => Size2d) => Point2d[];
    getStrokeDefs?: (getSize: () => Size2d) => (SVGDefs & { thicknesses: number[]; offset?: number })[];
    getFillDefs?: (getSize: () => Size2d) => SVGDefs[];
    renderChildren: (getSize: () => Size2d, getClipPath: () => string, getClipPoints: () => Point2d[]) => JSX.Element;
}>;
