import type { ShapeConst, Size2d } from "@thewaver/ss-utils";

import type { ShapeProps } from "../../../../Lib/Exotics/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";
import type {
    GradientConfig,
    IterationConfig,
    PatternConfig,
    SVGDefsColors,
} from "../../Samples/SVGDefs/SVGDefs.types";

export type ShapeExampleProps = Pick<ShapeProps, "getLameExponents" | "getJoinRadii"> &
    AccessorProps<{
        shouldClipChildren?: boolean;
        shouldPadChildren?: boolean;
        blurWidth?: number;
        animationDurationMs: number;
        colors: SVGDefsColors;
        shapeKind: ShapeConst.DefaultShape;
        strokeConfig: GradientConfig;
        fillConfig: PatternConfig;
        iterationConfig: IterationConfig;
        cellSize: Size2d;
        edgeThicknesses: number[];
    }>;
