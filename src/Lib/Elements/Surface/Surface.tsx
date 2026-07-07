import { createMemo } from "solid-js";

import { Shape } from "../../Fundamentals/Shape/Shape";
import { ShapeConst } from "../../Fundamentals/Shape/Shape.const";
import type { SurfaceProps } from "./Surface.types";

export const Surface = (props: SurfaceProps) => {
    const getBorderWidths = createMemo(() => {
        const namedWidths = props.getBorderWidths();

        return [
            namedWidths.borderTopWidth,
            namedWidths.borderRightWidth,
            namedWidths.borderBottomWidth,
            namedWidths.borderLeftWidth,
        ];
    });

    const getJoinRadii = createMemo(() => {
        const namedRadii = props.getBorderRadii();

        return [
            namedRadii.borderTopLeftRadius,
            namedRadii.borderTopRightRadius,
            namedRadii.borderBottomRightRadius,
            namedRadii.borderBottomLeftRadius,
        ];
    });

    const getLameExponents = createMemo(() => {
        const namedShapes = props.getLameExponents?.();

        if (!namedShapes) return [ShapeConst.CORNER_SHAPE_LAME_EXPONENTS.round];

        return [
            namedShapes.cornerTopLeftShape,
            namedShapes.cornerTopRightShape,
            namedShapes.cornerBottomRightShape,
            namedShapes.cornerBottomLeftShape,
        ];
    });

    return (
        <Shape
            getPoints={(getSize) => ShapeConst.getDefaultShapePoints("square", getSize())}
            getFillDefs={props.getFillDefs}
            getStrokeDefs={(getSize) => {
                const strokeDefs = props.getStrokeDefs?.(getSize);

                if (!strokeDefs) return [];
                return strokeDefs.map((def) => ({ ...def, thicknesses: getBorderWidths() }));
            }}
            joinRadii={getJoinRadii()}
            lameExponents={getLameExponents()}
            renderChildren={props.renderChildren}
        />
    );
};
