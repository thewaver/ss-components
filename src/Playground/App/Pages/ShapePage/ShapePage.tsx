import { For, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { ShapeConst } from "../../../../Lib/Fundamentals/Shape/Shape.const";
import {
    SHAPE_EDGE_THICKNESS_KINDS,
    SHAPE_JOIN_KINDS,
    type ShapeEdgeThicknessKind,
    type ShapeJoinKind,
} from "../../../../Lib/Fundamentals/Shape/Shape.types";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";
import type { ShapeExampleProps } from "./ShapePage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./ShapePage.css";

const STARTING_COLORS: SVGDefsSamples.ColorDefs = {
    background: "#282018",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

const DefaultExampleWrapper = (props: ShapeExampleProps) => {
    return <DefaultExample {...props} />;
};

export const ShapePage = () => {
    const [getHasIndividualCorners, setHasIndividualCorners] = createSignal(false);
    const [getShouldClipChildren, setShouldClipChildren] = createSignal(true);
    const [getShouldPadChildren, setShouldPadChildren] = createSignal(true);
    const [getBlurWidth, setBlurWidth] = createSignal(8);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getShapeKind, setShapeKind] = createSignal<ShapeConst.DefaultShape>("square");
    const [getEdgeThicknesses, setEdgeThicknesses] = createSignal<number[]>([4, 4, 4, 4, 4, 4]);
    const [getEdgeThicknessKind, setEdgeThicknessKind] = createSignal<ShapeEdgeThicknessKind[]>([
        "constant",
        "constant",
        "constant",
        "constant",
        "constant",
        "constant",
    ]);
    const [getJoinRadii, setJoinRadii] = createSignal<number[]>([20, 20, 20, 20, 20, 20]);
    const [getJoinKind, setJoinKind] = createSignal<ShapeJoinKind[]>([
        "round",
        "round",
        "round",
        "round",
        "round",
        "round",
    ]);
    const [getStrokeConfigKey, setStrokeConfigKey] =
        createSignal<keyof typeof SVGDefsSamples.SAMPLE_CONFIGS>("sweepDiagonal_1v1");
    const [colors, setColors] = createStore(STARTING_COLORS);

    const getShapePointCount = createMemo(
        () => ShapeConst.getDefaultShapePoints(getShapeKind(), { width: 0, height: 0 }).length,
    );

    const getPointIterator = createMemo(() => {
        const pointCount = getShapePointCount();

        return Array.from({ length: getHasIndividualCorners() ? pointCount : 1 }, (_, idx) => idx);
    });

    const getTemplateColumns = createMemo(() => {
        const pointCount = getShapePointCount();

        return `repeat(${getHasIndividualCorners() ? pointCount * 0.5 : 1}, 1fr)`;
    });

    const getExamples = createMemo(() => {
        const commonProps: ShapeExampleProps = {
            getShouldClipChildren,
            getShouldPadChildren,
            getBlurWidth,
            getAnimationDurationMs,
            getColors: () => colors,
            getShapeKind,
            getStrokeConfig: () => SVGDefsSamples.SAMPLE_CONFIGS[getStrokeConfigKey()],
            edgeThicknesses: getEdgeThicknesses().slice(0, getShapePointCount()),
            edgeThicknessKinds: getEdgeThicknessKind().slice(0, getShapePointCount()),
            joinRadii: getJoinRadii().slice(0, getShapePointCount()),
            joinKinds: getJoinKind().slice(0, getShapePointCount()),
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                src: DEFAULT_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root} style={assignInlineVars({ [styles.backgroundColor]: colors.background })}>
            <div class={pageStyles.globalPropsContainer}>
                <div class={pageStyles.propContainer}>
                    <div>{"Individual corner settings"}</div>
                    <input
                        type="checkbox"
                        checked={getHasIndividualCorners()}
                        onChange={() => setHasIndividualCorners((prev) => !prev)}
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Clip children"}</div>
                    <input
                        type="checkbox"
                        checked={getShouldClipChildren()}
                        onChange={() => setShouldClipChildren((prev) => !prev)}
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Pad children"}</div>
                    <input
                        type="checkbox"
                        checked={getShouldPadChildren()}
                        onChange={() => setShouldPadChildren((prev) => !prev)}
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Edge Thickness Kind"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <select
                                    value={getEdgeThicknessKind()[getIndex()]}
                                    onChange={(e) =>
                                        setEdgeThicknessKind((prev) => {
                                            const value = e.target.value as ShapeEdgeThicknessKind;

                                            if (!getHasIndividualCorners())
                                                return [value, value, value, value, value, value];

                                            const next = [...prev];
                                            next[getIndex()] = value;

                                            return next;
                                        })
                                    }
                                >
                                    <For each={SHAPE_EDGE_THICKNESS_KINDS}>
                                        {(config) => <option value={config}>{config}</option>}
                                    </For>
                                </select>
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Join Kind"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <select
                                    value={getJoinKind()[getIndex()]}
                                    onChange={(e) =>
                                        setJoinKind((prev) => {
                                            const value = e.target.value as ShapeJoinKind;

                                            if (!getHasIndividualCorners())
                                                return [value, value, value, value, value, value];

                                            const next = [...prev];
                                            next[getIndex()] = value;

                                            return next;
                                        })
                                    }
                                >
                                    <For each={SHAPE_JOIN_KINDS}>
                                        {(config) => <option value={config}>{config}</option>}
                                    </For>
                                </select>
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Shape"}</div>
                    <select
                        value={getShapeKind()}
                        onChange={(e) => setShapeKind(e.target.value as ShapeConst.DefaultShape)}
                    >
                        <For each={ShapeConst.DEFAULT_SHAPES}>
                            {(config) => <option value={config}>{config}</option>}
                        </For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Edge Thickness (px)"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <input
                                    type="number"
                                    min={0}
                                    max={80}
                                    step={1}
                                    value={getEdgeThicknesses()[getIndex()]}
                                    onInput={(e) =>
                                        setEdgeThicknesses((prev) => {
                                            const value = Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80);

                                            if (!getHasIndividualCorners())
                                                return [value, value, value, value, value, value];

                                            const next = [...prev];
                                            next[getIndex()] = value;

                                            return next;
                                        })
                                    }
                                />
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Joint Radii (px)"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <input
                                    type="number"
                                    min={0}
                                    max={80}
                                    step={5}
                                    value={getJoinRadii()[getIndex()]}
                                    onInput={(e) =>
                                        setJoinRadii((prev) => {
                                            const value = Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80);

                                            if (!getHasIndividualCorners())
                                                return [value, value, value, value, value, value];

                                            const next = [...prev];
                                            next[getIndex()] = value;

                                            return next;
                                        })
                                    }
                                />
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Stroke Pattern"}</div>
                    <select
                        value={getStrokeConfigKey()}
                        onChange={(e) =>
                            setStrokeConfigKey(e.target.value as keyof typeof SVGDefsSamples.SAMPLE_CONFIGS)
                        }
                    >
                        <For each={Object.keys(SVGDefsSamples.SAMPLE_CONFIGS)}>
                            {(config) => <option value={config}>{config}</option>}
                        </For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Colors"}</div>
                    <div class={styles.colorList}>
                        <For each={Object.entries(colors)}>
                            {([key, value]) => (
                                <input
                                    type="color"
                                    value={value}
                                    onChange={(e) => setColors(key as keyof typeof colors, e.target.value)}
                                />
                            )}
                        </For>
                    </div>
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Blur (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={40}
                        step={1}
                        value={getBlurWidth()}
                        onInput={(e) =>
                            setBlurWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 40))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Animation duration (ms)"}</div>
                    <input
                        type="number"
                        min={1000}
                        max={5000}
                        step={100}
                        value={getAnimationDurationMs()}
                        onInput={(e) =>
                            setAnimationDurationMs((prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 1000), 5000),
                            )
                        }
                    />
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
