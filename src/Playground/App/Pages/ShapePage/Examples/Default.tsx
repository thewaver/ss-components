import { createUniqueId } from "solid-js";

import { Shape } from "../../../../../Lib/Fundamentals/Shape/Shape";
import { ShapeConst } from "../../../../../Lib/Fundamentals/Shape/Shape.const";
import type { ShapeExampleProps } from "../ShapePage.types";

import * as styles from "../ShapePage.css";

export const DefaultExample = ({
    getShapeKind,
    getStrokeConfig,
    getAnimationDurationMs,
    getColors,
    getBlurWidth,
    ...otherProps
}: ShapeExampleProps) => {
    const strokeId = createUniqueId();

    return (
        <Shape
            {...otherProps}
            getPoints={(size) => ShapeConst.getDefaultShapePoints(getShapeKind(), size)}
            getStrokeDefs={(size, interactionState) =>
                getStrokeConfig().getSVGDefs(strokeId, () => interactionState, {
                    getSize: () => size,
                    getAnimationDurationMs,
                    getColors,
                    getBlurWidth,
                })
            }
            renderChildren={() => <div class={styles.example}>I have a border</div>}
        />
    );
};
