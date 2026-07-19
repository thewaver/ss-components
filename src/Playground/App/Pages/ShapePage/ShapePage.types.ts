import type { ShapeConst, Size2d } from "@thewaver/ss-utils";

import type { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import type { ShapeProps } from "../../../../Lib/Fundamentals/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ShapeExampleProps = Pick<ShapeProps, "lameExponents" | "joinRadii"> &
    AccessorProps<{
        shouldClipChildren?: boolean;
        shouldPadChildren?: boolean;
        blurWidth?: number;
        animationDurationMs: number;
        colors: SVGDefsSamples.ColorDefs;
        shapeKind: ShapeConst.DefaultShape;
        strokeConfig: SVGDefsSamples.Gradient.ConfigDefs;
        fillConfig: SVGDefsSamples.Pattern.ConfigDefs;
        cellSize: Size2d;
        edgeThicknesses: number[];
    }>;
