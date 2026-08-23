import type { ShapeConst, Size2d } from "@thewaver/ss-utils";

import type { ShapeProps } from "../../../../Lib/Exotics/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type { SVGDefsSamples } from "../../Samples/SVGDefs/SVGDefs.const";
import type { SVGDefsColors } from "../../Samples/SVGDefs/SVGDefs.types";

export type ShapeExampleProps = Pick<ShapeProps, "lameExponents" | "joinRadii"> &
    AccessorProps<{
        shouldClipChildren?: boolean;
        shouldPadChildren?: boolean;
        blurWidth?: number;
        animationDurationMs: number;
        colors: SVGDefsColors;
        shapeKind: ShapeConst.DefaultShape;
        strokeConfigKey: SVGDefsSamples.Gradient.SampleKey;
        fillConfigKey: SVGDefsSamples.Pattern.SampleKey;
        iterationConfigKey: SVGDefsSamples.Iteration.SampleKey;
        cellSize: Size2d;
        edgeThicknesses: number[];
    }>;
