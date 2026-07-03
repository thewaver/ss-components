import { createMemo, createSignal, createUniqueId } from "solid-js";

import { InteractionUtils } from "../../../../../Lib/Abstracts/Interaction/Interaction.utils";
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

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const { getFlags } = InteractionUtils.wrapElement(getRootRef, () => false);

    return (
        <Shape
            {...otherProps}
            getPoints={(getSize) => ShapeConst.getDefaultShapePoints(getShapeKind(), getSize())}
            getStrokeDefs={(getSize) =>
                getStrokeConfig().getSVGDefs(strokeId, getFlags, {
                    getSize,
                    getAnimationDurationMs,
                    getColors,
                    getBlurWidth,
                })
            }
            renderInternals={(getSize) => {
                const getOutlinePaths = createMemo(() => {
                    const pts = ShapeConst.getDefaultShapePoints(getShapeKind(), getSize());

                    return ShapeUtils.getPaths(pts, [2], otherProps.joinRadii, otherProps.lameExponents);
                });

                return (
                    getFlags().isFocused && (
                        <path
                            d={`${getOutlinePaths().outerPath} ${getOutlinePaths().innerPath}`}
                            fill-rule="evenodd"
                            fill="#FF00FF"
                        />
                    )
                );
            }}
            renderChildren={(getSize, getPaths) => {
                const getStyle = createMemo(() => {
                    const size = getSize();
                    const shape = getShapeKind();
                    const { innerPath, innerPoints } = getPaths();
                    const clipStyle = getShouldClipChildren?.() ? { "clip-path": `path("${innerPath}")` } : {};

                    if (!getShouldPadChildren?.()) return clipStyle;

                    const paddingStyle =
                        shape === "square"
                            ? ShapeUtils.getRectPadding(
                                  otherProps.edgeThicknesses,
                                  otherProps.joinRadii,
                                  otherProps.lameExponents,
                              )
                            : ShapeUtils.getPolygonPadding(size, innerPoints);

                    return { ...clipStyle, ...paddingStyle };
                });

                return (
                    <div ref={setRootRef} class={styles.example} style={getStyle()}>
                        <div class={styles.exampleInner}>I have a border</div>
                    </div>
                );
            }}
        />
    );
};
