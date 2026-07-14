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
    getFillConfig,
    getCellSize,
    getAnimationDurationMs,
    getColors,
    getBlurWidth,
    edgeThicknesses,
    ...otherProps
}: ShapeExampleProps) => {
    const id = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const { getFlags } = InteractionUtils.wrapElement(getRootRef, () => false);

    return (
        <Shape
            {...otherProps}
            getPoints={(getSize) => ShapeConst.getDefaultShapePoints(getShapeKind(), getSize())}
            getStrokeDefs={(getSize) => {
                const strokes = getStrokeConfig()
                    .getSVGDefs(`stroke-${id}`, getFlags, {
                        getSize,
                        getAnimationDurationMs,
                        getColors,
                        getBlurWidth,
                    })
                    .map((config) => ({ ...config, thicknesses: edgeThicknesses }));

                if (getFlags().isFocused)
                    strokes.push({
                        color: "#FF00FF",
                        thicknesses: [2],
                    });

                return strokes;
            }}
            getFillDefs={(getSize) =>
                getFillConfig().getSVGDefs(`fill-${id}`, undefined, {
                    getSize,
                    getCellSize,
                    getAnimationDurationMs,
                    getColors,
                    getBlurWidth,
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
                            ? ShapeUtils.getRectPadding(edgeThicknesses, otherProps.joinRadii, otherProps.lameExponents)
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
