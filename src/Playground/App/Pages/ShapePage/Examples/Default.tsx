import { Shape } from "../../../../../Lib/Fundamentals/Shape/Shape";
import { ShapeConst } from "../../../../../Lib/Fundamentals/Shape/Shape.const";
import type { ShapeExampleProps } from "../ShapePage.types";

export const DefaultExample = ({ getShapeKind, ...otherProps }: ShapeExampleProps) => {
    return <Shape {...otherProps} getPoints={(size) => ShapeConst.getDefaultShapePoints(getShapeKind(), size)} />;
};
