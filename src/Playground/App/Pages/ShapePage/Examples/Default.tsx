import { type JSX, createMemo, createUniqueId } from "solid-js";

import { Shape } from "../../../../../Lib/Fundamentals/Shape/Shape";
import { ShapeConst } from "../../../../../Lib/Fundamentals/Shape/Shape.const";
import { ShapeUtils } from "../../../../../Lib/Fundamentals/Shape/Shape.utils";
import type { ShapeExampleProps } from "../ShapePage.types";

import * as styles from "../ShapePage.css";

export const DefaultExample = ({
    getShouldClipChildren,
    getShouldPadChildren,
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
            renderChildren={(getSize, getInnerPath, getInnerPoints) => {
                const getStyle = createMemo(() => {
                    const size = getSize();
                    const innerPath = getInnerPath();
                    const innerPoints = getInnerPoints();
                    const isSquare = getShapeKind() === "square";
                    const clipStyle = getShouldClipChildren?.() ? { "clip-path": `path("${innerPath}")` } : {};

                    if (!getShouldPadChildren?.()) return clipStyle;

                    const innerRect = isSquare
                        ? { x: 0, y: 0, width: 0, height: 0 }
                        : ShapeUtils.getInnerRect(innerPoints);
                    const paddingStyle = isSquare
                        ? {
                              "padding-top": `${Math.max(otherProps.edgeThicknesses[0], otherProps.joinRadii?.[0] ?? 0)}px`,
                              "padding-right": `${Math.max(otherProps.edgeThicknesses[1], otherProps.joinRadii?.[1] ?? 0)}px`,
                              "padding-bottom": `${Math.max(otherProps.edgeThicknesses[2], otherProps.joinRadii?.[2] ?? 0)}px`,
                              "padding-left": `${Math.max(otherProps.edgeThicknesses[3], otherProps.joinRadii?.[3] ?? 0)}px`,
                          }
                        : {
                              "padding-top": `${innerRect.y}px`,
                              "padding-left": `${innerRect.x}px`,
                              "padding-bottom": `${size.height - innerRect.y - innerRect.height}px`,
                              "padding-right": `${size.width - innerRect.x - innerRect.width}px`,
                          };

                    return { ...clipStyle, ...paddingStyle };
                });

                return (
                    <div class={styles.example} style={getStyle()}>
                        <div class={styles.exampleInner}>I have a border</div>
                    </div>
                );
            }}
        />
    );
};
