import type { ShapeConst, Size2d } from "@thewaver/ss-utils";

import type { ShapeProps } from "../../../../Lib/Fundamentals/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { SVGDefsSamples } from "../../Samples/SVGDefs.const";

export type ShapeExampleProps = Pick<ShapeProps, "getLameExponents" | "getJoinRadii"> &
    AccessorProps<{
        shouldClipChildren?: boolean;
        shouldPadChildren?: boolean;
        blurWidth?: number;
        animationDurationMs: number;
        colors: SVGDefsSamples.ColorDefs;
        shapeKind: ShapeConst.DefaultShape;
        strokeConfig: SVGDefsSamples.Gradient.ConfigDefs;
        fillConfig: SVGDefsSamples.Pattern.ConfigDefs;
        iterationConfig: SVGDefsSamples.Iteration.ConfigDefs;
        cellSize: Size2d;
        edgeThicknesses: number[];
    }>;
