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
                    .getSVGDefs(`stroke-${id}`, getFlags(), {
                        size: getSize(),
                        animationDurationMs: getAnimationDurationMs(),
                        colors: getColors(),
                        blurWidth: getBlurWidth?.(),
                        ...getIterationConfig().getDefs(getAnimationDurationMs()),
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
                    size: getSize(),
                    cellSize: getCellSize(),
                    animationDurationMs: getAnimationDurationMs(),
                    colors: getColors(),
                    blurWidth: getBlurWidth?.(),
                    ...getIterationConfig().getDefs(getAnimationDurationMs()),
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
