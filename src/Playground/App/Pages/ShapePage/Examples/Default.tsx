import { createMemo, createSignal, createUniqueId } from "solid-js";

import { ShapeConst, ShapeUtils } from "@thewaver/ss-utils";

import { InteractionUtils } from "../../../../../Lib/Abstracts/Interaction/Interaction.utils";
import { Shape } from "../../../../../Lib/Fundamentals/Shape/Shape";
import type { ShapeExampleProps } from "../ShapePage.types";

import * as styles from "../ShapePage.css";

export const DefaultExample = ({
    getShouldClipChildren,
    getShouldPadChildren,
    getShapeKind,
    getStrokeConfig,
    getFillConfig,
    getIterationConfig,
    getCellSize,
    getAnimationDurationMs,
    getColors,
    getBlurWidth,
    getEdgeThicknesses,
    ...otherProps
}: ShapeExampleProps) => {
    const id = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const { getFlags } = InteractionUtils.wrapElement(getRootRef, () => false, { applyButtonSemantics: true });

    return (
        <Shape
            {...otherProps}
            computePoints={(size) => ShapeConst.getDefaultShapePoints(getShapeKind(), size)}
            computeStrokeDefs={(getSize) => {
                const strokes = getStrokeConfig().computeSVGDefs(`stroke-${id}`, getFlags, {
                    getSize,
                    animationDurationMs: getAnimationDurationMs(),
                    colors: getColors(),
                    blurWidth: getBlurWidth?.(),
                    ...getIterationConfig().computeDefs(getAnimationDurationMs()),
                });

                if (getFlags().isFocused) {
                    strokes.push({ color: "#FF00FF" });
                }

                return strokes;
            }}
            getStrokeGeom={() => {
                const result = [{ thicknesses: getEdgeThicknesses() }];

                if (getFlags().isFocused) {
                    result.push({ thicknesses: [2] });
                }

                return result;
            }}
            computeFillDefs={(getSize) =>
                getFillConfig().computeSVGDefs(`fill-${id}`, undefined, {
                    getSize,
                    cellSize: getCellSize(),
                    animationDurationMs: getAnimationDurationMs(),
                    colors: getColors(),
                    blurWidth: getBlurWidth?.(),
                    ...getIterationConfig().computeDefs(getAnimationDurationMs()),
                })
            }
            renderChildren={(getSize, getClipPath, getClipPoints) => {
                const getStyle = createMemo(() => {
                    const size = getSize();
                    const shape = getShapeKind();
                    const clipStyle = getShouldClipChildren?.() ? { "clip-path": `path("${getClipPath()}")` } : {};

                    if (!getShouldPadChildren?.()) return clipStyle;

                    const paddingStyle =
                        shape === "square"
                            ? ShapeUtils.getRectPadding(
                                  getEdgeThicknesses(),
                                  otherProps.getJoinRadii?.(),
                                  otherProps.getLameExponents?.(),
                              )
                            : ShapeUtils.getPolygonPadding(size, getClipPoints());

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
