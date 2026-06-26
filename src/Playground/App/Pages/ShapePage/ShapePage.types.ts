import type { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import type { ShapeConst } from "../../../../Lib/Fundamentals/Shape/Shape.const";
import type { ShapeProps } from "../../../../Lib/Fundamentals/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ShapeExampleProps = Pick<ShapeProps, "edgeThicknessKinds" | "edgeThicknesses" | "joinKinds" | "joinRadii"> &
    AccessorProps<{
        shouldPadChildren?: boolean;
        blurWidth?: number;
        animationDurationMs: number;
        colors: SVGDefsSamples.ColorDefs;
        shapeKind: ShapeConst.DefaultShape;
        strokeConfig: SVGDefsSamples.ConfigDefs;
    }>;
