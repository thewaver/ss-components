import { For, createMemo, createSignal, createUniqueId } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { Shape } from "../../../../Lib/Fundamentals/Shape/Shape";
import { ShapeConst } from "../../../../Lib/Fundamentals/Shape/Shape.const";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";
import type { ShapeExampleProps } from "./ShapePage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./ShapePage.css";

const STRESS_ITEMS: (StressTestDefs & { size: number })[] = [
    {
        count: 40,
        cols: 8,
        gap: 20,
        size: 160,
    },
    {
        count: 160,
        cols: 16,
        gap: 10,
        size: 80,
    },
    {
        count: 640,
        cols: 32,
        gap: 5,
        size: 40,
    },
];

const STARTING_COLORS: SVGDefsSamples.ColorDefs = {
    background: "#282018",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

const StressTestWrapper = ({
    getShouldClipChildren,
    getShouldPadChildren,
    getShapeKind,
    getStrokeConfig,
    getAnimationDurationMs,
    getColors,
    getBlurWidth,
    edgeThicknesses,
    ...otherProps
}: ShapeExampleProps) => {
    const strokeId = createUniqueId();

    return (
        <StressTest
            getConfigs={() => STRESS_ITEMS}
            renderLabel={(getConfigIndex) => `Render ${STRESS_ITEMS[getConfigIndex()].count} items`}
            renderItem={(getConfigIndex, getItemIndex) => (
                <Shape
                    {...otherProps}
                    joinRadii={otherProps.joinRadii?.map(
                        (n) => (n * STRESS_ITEMS[getConfigIndex()].size) / styles.exampleSize,
                    )}
                    getPoints={(getSize) => ShapeConst.getDefaultShapePoints(getShapeKind(), getSize())}
                    getStrokeDefs={(getSize) =>
                        getStrokeConfig()
                            .getSVGDefs(strokeId, undefined, {
                                getSize,
                                getAnimationDurationMs,
                                getColors,
                                getBlurWidth,
                            })
                            .map((config) => ({ ...config, thicknesses: edgeThicknesses }))
                    }
                    renderChildren={() => {
                        return (
                            <div
                                class={styles.stressExample}
                                style={{
                                    width: `${STRESS_ITEMS[getConfigIndex()].size}px`,
                                    height: `${STRESS_ITEMS[getConfigIndex()].size}px`,
                                }}
                            >
                                {getItemIndex()}
                            </div>
                        );
                    }}
                />
            )}
        />
    );
};

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
    const [getJoinRadii, setJoinRadii] = createSignal<number[]>([80, 80, 80, 80, 80, 80]);
    const [getLameExponent, setLameExponent] = createSignal<number[]>([1, 1, 1, 1, 1, 1]);
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
            joinRadii: getJoinRadii().slice(0, getShapePointCount()),
            lameExponents: getLameExponent().slice(0, getShapePointCount()),
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                src: DEFAULT_SOURCE,
            },
            {
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} />,
                src: "",
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
                                    max={160}
                                    step={5}
                                    value={getJoinRadii()[getIndex()]}
                                    onInput={(e) =>
                                        setJoinRadii((prev) => {
                                            const value = Math.min(Math.max(Number(e.target.value) ?? prev, 0), 160);

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
                    <div>{"Lamé Exponent"}</div>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <input
                                    type="number"
                                    min={-5}
                                    max={5}
                                    step={0.5}
                                    value={getLameExponent()[getIndex()]}
                                    onInput={(e) =>
                                        setLameExponent((prev) => {
                                            const value = Math.min(Math.max(Number(e.target.value) ?? prev, -5), 5);

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
