import { createMemo, createSignal, createUniqueId } from "solid-js";

import { ShapeConst, ShapeUtils } from "@thewaver/ss-utils";

import { InteractionUtils } from "../../../../../Lib/Abstracts/Interaction/Interaction.utils";
import { Shape } from "../../../../../Lib/Exotics/Shape/Shape";
import { access } from "../../../../../Lib/Utils/propUtils";
import { SVGDefsSamples } from "../../../Samples/SVGDefs/SVGDefs.const";
import type { ShapeExampleProps } from "../ShapePage.types";

import * as styles from "../ShapePage.css";

export const DefaultExample = ({
    shouldClipChildren,
    shouldPadChildren,
    shapeKind,
    strokeConfigKey,
    fillConfigKey,
    iterationConfigKey,
    cellSize,
    animationDurationMs,
    colors,
    blurWidth,
    edgeThicknesses,
    ...otherProps
}: ShapeExampleProps) => {
    const id = createUniqueId();

    const [getRootRef, setRootRef] = createSignal<HTMLElement>();

    const { getFlags } = InteractionUtils.wrapElement(getRootRef, () => false, { applyButtonSemantics: true });

    const getStrokeConfig = () => SVGDefsSamples.Gradient.SAMPLE_CONFIGS[access(strokeConfigKey)];
    const getFillConfig = () => SVGDefsSamples.Pattern.SAMPLE_CONFIGS[access(fillConfigKey)];
    const getIterationConfig = () => SVGDefsSamples.Iteration.SAMPLE_CONFIGS[access(iterationConfigKey)];

    return (
        <div class={styles.exampleHost}>
            <Shape
                {...otherProps}
                computePoints={(size) => ShapeConst.getDefaultShapePoints(access(shapeKind), size)}
                computeStrokeDefs={(getSize) => {
                    const strokes = getStrokeConfig().computeSVGDefs(`stroke-${id}`, getFlags, {
                        getSize,
                        animationDurationMs: access(animationDurationMs),
                        colors: access(colors),
                        blurWidth: access(blurWidth),
                        ...getIterationConfig().computeDefs(access(animationDurationMs)),
                    });

                    if (getFlags().isFocused) {
                        strokes.push({ color: "#FF00FF" });
                    }

                    return strokes;
                }}
                strokeGeom={() => {
                    const result = [{ thicknesses: access(edgeThicknesses) }];

                    if (getFlags().isFocused) {
                        result.push({ thicknesses: [2] });
                    }

                    return result;
                }}
                computeFillDefs={(getSize) =>
                    getFillConfig().computeSVGDefs(`fill-${id}`, undefined, {
                        getSize,
                        cellSize: access(cellSize),
                        animationDurationMs: access(animationDurationMs),
                        colors: access(colors),
                        blurWidth: access(blurWidth),
                        ...getIterationConfig().computeDefs(access(animationDurationMs)),
                    })
                }
                renderChildren={(getSize, getClipPath, getClipPoints) => {
                    const getStyle = createMemo(() => {
                        const size = getSize();
                        const shape = access(shapeKind);
                        const clipStyle = access(shouldClipChildren) ? { "clip-path": `path("${getClipPath()}")` } : {};

                        if (!access(shouldPadChildren)) return clipStyle;

                        const paddingStyle =
                            shape === "square"
                                ? ShapeUtils.getRectPadding(
                                      access(edgeThicknesses),
                                      access(otherProps.joinRadii),
                                      access(otherProps.lameExponents),
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
        </div>
    );
};
