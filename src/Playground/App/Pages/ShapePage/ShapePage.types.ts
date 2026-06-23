import type { ShapeConst } from "../../../../Lib/Fundamentals/Shape/Shape.const";
import type { ShapeProps } from "../../../../Lib/Fundamentals/Shape/Shape.types";
import type { AccessorProps } from "../../../../Lib/Utils/typeUtils";

export type ShapeExampleProps = Omit<ShapeProps, "getPoints"> &
    AccessorProps<{
        shapeKind: ShapeConst.DefaultShape;
    }>;
