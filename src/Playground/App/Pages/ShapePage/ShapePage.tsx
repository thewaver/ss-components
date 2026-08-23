import { For, createMemo, createSignal, createUniqueId } from "solid-js";
import { createStore } from "solid-js/store";

import { ShapeConst } from "@thewaver/ss-utils";
import { assignInlineVars } from "@vanilla-extract/dynamic";

import { Shape } from "../../../../Lib/Exotics/Shape/Shape";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { SVGDefsSamples } from "../../Samples/SVGDefs/SVGDefs.const";
import type { SVGDefsColors } from "../../Samples/SVGDefs/SVGDefs.types";
import {
    PageCheckField,
    PageColorField,
    PageGroupedSelectField,
    PageNumberField,
    PageSelectField,
} from "../../StyledComponents/Field/Field";
import { DefaultExample } from "./Examples/Default";
import type { ShapeExampleProps } from "./ShapePage.types";

import * as styles from "./ShapePage.css";

const extractOptionGroupWord = (key: string) => {
    const match = key.match(/^[a-z]+/);
    return match ? match[0] : key;
};

const splitEntriesIntoGroups = <K, T extends Record<string, K>>(
    o: T,
    getGroupName: (key: string) => string = extractOptionGroupWord,
) => {
    const result: Record<string, Partial<T>> = {};

    for (const [key, value] of Object.entries(o) as [keyof T, T[keyof T]][]) {
        const group = getGroupName(key as string);

        result[group] ??= {};
        result[group][key] = value;
    }

    return result;
};

const GROUPPED_GRADIENTS = splitEntriesIntoGroups(SVGDefsSamples.Gradient.SAMPLE_CONFIGS);
const GROUPPED_PATTERNS = splitEntriesIntoGroups(SVGDefsSamples.Pattern.SAMPLE_CONFIGS);

const CORNER_FIELD_WIDTH = 80;
const MIN_EDGE_THICKNESS = 0;
const MAX_EDGE_THICKNESS = 80;
const EDGE_THICKNESS_STEP = 1;
const MIN_JOIN_RADIUS = 0;
const MAX_JOIN_RADIUS = 160;
const JOIN_RADIUS_STEP = 5;
const MIN_LAME_EXPONENT = -5;
const MAX_LAME_EXPONENT = 5;
const LAME_EXPONENT_STEP = 0.5;
const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 160;
const CELL_SIZE_STEP = 10;
const MIN_BLUR_WIDTH = 0;
const MAX_BLUR_WIDTH = 40;
const BLUR_WIDTH_STEP = 1;
const MIN_DURATION_MS = 1000;
const MAX_DURATION_MS = 5000;
const DURATION_STEP_MS = 100;

const spreadCornerValue = (previous: number[], index: number, value: number, hasIndividualCorners: boolean) => {
    if (!hasIndividualCorners) return previous.map(() => value);

    const next = [...previous];

    next[index] = value;

    return next;
};

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

const STARTING_COLORS: SVGDefsColors = {
    background: "#282420",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const DEFAULT_EXAMPLE_PATH = "/src/Playground/App/Pages/ShapePage/Examples/Default.tsx";

const StressTestWrapper = ({
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

    const getStrokeConfig = () => SVGDefsSamples.Gradient.SAMPLE_CONFIGS[access(strokeConfigKey)];
    const getFillConfig = () => SVGDefsSamples.Pattern.SAMPLE_CONFIGS[access(fillConfigKey)];
    const getIterationConfig = () => SVGDefsSamples.Iteration.SAMPLE_CONFIGS[access(iterationConfigKey)];

    return (
        <StressTest
            configs={() => STRESS_ITEMS}
            renderLabel={(getConfigIndex) => `Render ${STRESS_ITEMS[getConfigIndex()].count} items`}
            renderItem={(getConfigIndex, getItemIndex) => (
                <Shape
                    {...otherProps}
                    joinRadii={() =>
                        access(otherProps.joinRadii)!.map(
                            (n) => (n * STRESS_ITEMS[getConfigIndex()].size) / styles.exampleSize,
                        )
                    }
                    computePoints={(size) => ShapeConst.getDefaultShapePoints(access(shapeKind), size)}
                    computeStrokeDefs={(getSize) =>
                        getStrokeConfig().computeSVGDefs(`stroke-${id}`, undefined, {
                            getSize,
                            animationDurationMs: access(animationDurationMs),
                            colors: access(colors),
                            blurWidth: access(blurWidth),
                            ...getIterationConfig().computeDefs(access(animationDurationMs)),
                        })
                    }
                    strokeGeom={() => [
                        {
                            thicknesses: access(edgeThicknesses).map(
                                (t) => (t * STRESS_ITEMS[getConfigIndex()].size) / styles.exampleSize,
                            ),
                        },
                    ]}
                    computeFillDefs={(getSize) =>
                        getFillConfig().computeSVGDefs(`fill-${id}`, undefined, {
                            getSize,
                            cellSize: {
                                width:
                                    (access(cellSize).width * STRESS_ITEMS[getConfigIndex()].size) / styles.exampleSize,
                                height:
                                    (access(cellSize).height * STRESS_ITEMS[getConfigIndex()].size) /
                                    styles.exampleSize,
                            },
                            animationDurationMs: access(animationDurationMs),
                            colors: access(colors),
                            blurWidth: access(blurWidth),
                            ...getIterationConfig().computeDefs(access(animationDurationMs)),
                        })
                    }
                    renderChildren={(_, getClipPath) => {
                        return (
                            <div
                                class={styles.stressExample}
                                style={{
                                    "width": `${STRESS_ITEMS[getConfigIndex()].size}px`,
                                    "height": `${STRESS_ITEMS[getConfigIndex()].size}px`,
                                    "clip-path": `path("${getClipPath()}")`,
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
    const [getJoinRadii, setJoinRadii] = createSignal<number[]>([40, 40, 40, 40, 40, 40]);
    const [getLameExponents, setLameExponents] = createSignal<number[]>([1, 1, 1, 1, 1, 1]);
    const [getStrokeConfigKey, setStrokeConfigKey] = createSignal<SVGDefsSamples.Gradient.SampleKey>("sweep_diag_1v1");
    const [getFillConfigKey, setFillConfigKey] = createSignal<SVGDefsSamples.Pattern.SampleKey>("plain");
    const [getIterationConfigKey, setIterationConfigKey] = createSignal<SVGDefsSamples.Iteration.SampleKey>("constant");
    const [getCellSize, setCellSize] = createSignal(40);
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
            shouldClipChildren: getShouldClipChildren,
            shouldPadChildren: getShouldPadChildren,
            blurWidth: getBlurWidth,
            animationDurationMs: getAnimationDurationMs,
            colors: () => colors,
            shapeKind: getShapeKind,
            strokeConfigKey: getStrokeConfigKey,
            fillConfigKey: getFillConfigKey,
            iterationConfigKey: getIterationConfigKey,
            cellSize: () => ({ width: getCellSize(), height: getCellSize() }),
            edgeThicknesses: () => getEdgeThicknesses().slice(0, getShapePointCount()),
            joinRadii: () => getJoinRadii().slice(0, getShapePointCount()),
            lameExponents: () => getLameExponents().slice(0, getShapePointCount()),
        };

        return [
            {
                key: "default",
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                path: DEFAULT_EXAMPLE_PATH,
                sampleKeys: () => [
                    `Gradient/${getStrokeConfigKey()}`,
                    `Pattern/${getFillConfigKey()}`,
                    `Iteration/${getIterationConfigKey()}`,
                ],
            },
            {
                key: "stressTest",
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} />,
            },
        ];
    });

    return (
        <div class={styles.root} style={assignInlineVars({ [styles.backgroundColor]: colors.background })}>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"hasIndividualCorners"} label={"Individual corner settings"}>
                    <PageCheckField
                        value={getHasIndividualCorners}
                        ariaLabel={"Individual corner settings"}
                        onChange={setHasIndividualCorners}
                    />
                </PageProp>

                <PageProp key={"shouldClipChildren"} label={"Clip children"}>
                    <PageCheckField
                        value={getShouldClipChildren}
                        ariaLabel={"Clip children"}
                        onChange={setShouldClipChildren}
                    />
                </PageProp>

                <PageProp key={"shouldPadChildren"} label={"Pad children"}>
                    <PageCheckField
                        value={getShouldPadChildren}
                        ariaLabel={"Pad children"}
                        onChange={setShouldPadChildren}
                    />
                </PageProp>

                <PageProp key={"edgeThicknessPx"} label={"Edge Thickness (px)"}>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <PageNumberField
                                    value={() => getEdgeThicknesses()[getIndex()]}
                                    min={() => MIN_EDGE_THICKNESS}
                                    max={() => MAX_EDGE_THICKNESS}
                                    step={() => EDGE_THICKNESS_STEP}
                                    width={() => CORNER_FIELD_WIDTH}
                                    ariaLabel={() => `Edge thickness ${getIndex() + 1}`}
                                    onInput={(value) =>
                                        setEdgeThicknesses((prev) =>
                                            spreadCornerValue(prev, getIndex(), value, getHasIndividualCorners()),
                                        )
                                    }
                                />
                            )}
                        </For>
                    </div>
                </PageProp>

                <PageProp key={"jointRadiiPx"} label={"Joint Radii (px)"}>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <PageNumberField
                                    value={() => getJoinRadii()[getIndex()]}
                                    min={() => MIN_JOIN_RADIUS}
                                    max={() => MAX_JOIN_RADIUS}
                                    step={() => JOIN_RADIUS_STEP}
                                    width={() => CORNER_FIELD_WIDTH}
                                    id={() => `jointRadius${getIndex() + 1}`}
                                    ariaLabel={() => `Joint radius ${getIndex() + 1}`}
                                    onInput={(value) =>
                                        setJoinRadii((prev) =>
                                            spreadCornerValue(prev, getIndex(), value, getHasIndividualCorners()),
                                        )
                                    }
                                />
                            )}
                        </For>
                    </div>
                </PageProp>

                <PageProp key={"lameExponent"} label={"Lamé Exponent"}>
                    <div class={styles.valueList} style={{ "grid-template-columns": getTemplateColumns() }}>
                        <For each={getPointIterator()}>
                            {(_, getIndex) => (
                                <PageNumberField
                                    value={() => getLameExponents()[getIndex()]}
                                    min={() => MIN_LAME_EXPONENT}
                                    max={() => MAX_LAME_EXPONENT}
                                    step={() => LAME_EXPONENT_STEP}
                                    width={() => CORNER_FIELD_WIDTH}
                                    ariaLabel={() => `Lamé exponent ${getIndex() + 1}`}
                                    onInput={(value) =>
                                        setLameExponents((prev) =>
                                            spreadCornerValue(prev, getIndex(), value, getHasIndividualCorners()),
                                        )
                                    }
                                />
                            )}
                        </For>
                    </div>
                </PageProp>

                <PageProp key={"shapeKind"} label={"Shape"}>
                    <PageSelectField
                        value={getShapeKind}
                        values={() => ShapeConst.DEFAULT_SHAPES}
                        ariaLabel={"Shape"}
                        onChange={(shape) => setShapeKind(() => shape)}
                    />
                </PageProp>

                <PageProp key={"strokeConfigKey"} label={"Stroke Pattern"}>
                    <PageGroupedSelectField
                        value={getStrokeConfigKey}
                        groups={() =>
                            Object.entries(GROUPPED_GRADIENTS).map(
                                ([groupKey, groupValue]) =>
                                    [groupKey, Object.keys(groupValue)] as [
                                        string,
                                        (keyof typeof SVGDefsSamples.Gradient.SAMPLE_CONFIGS)[],
                                    ],
                            )
                        }
                        ariaLabel={"Stroke pattern"}
                        onChange={(config) => setStrokeConfigKey(() => config)}
                    />
                </PageProp>

                <PageProp key={"fillConfigKey"} label={"Fill Pattern"}>
                    <PageGroupedSelectField
                        value={getFillConfigKey}
                        groups={() =>
                            Object.entries(GROUPPED_PATTERNS).map(
                                ([groupKey, groupValue]) =>
                                    [groupKey, Object.keys(groupValue)] as [
                                        string,
                                        (keyof typeof SVGDefsSamples.Pattern.SAMPLE_CONFIGS)[],
                                    ],
                            )
                        }
                        ariaLabel={"Fill pattern"}
                        onChange={(config) => setFillConfigKey(() => config)}
                    />
                </PageProp>

                <PageProp key={"cellSize"} label={"Fill Cell Size (px)"}>
                    <PageNumberField
                        value={getCellSize}
                        min={() => MIN_CELL_SIZE}
                        max={() => MAX_CELL_SIZE}
                        step={() => CELL_SIZE_STEP}
                        ariaLabel={"Fill cell size"}
                        onInput={setCellSize}
                    />
                </PageProp>

                <PageProp key={"colors"} label={"Colors"}>
                    <div class={styles.colorList}>
                        <For each={Object.keys(colors)}>
                            {(key) => (
                                <PageColorField
                                    value={() => colors[key as keyof typeof colors]}
                                    ariaLabel={() => key}
                                    onInput={(value) => setColors(key as keyof typeof colors, value)}
                                />
                            )}
                        </For>
                    </div>
                </PageProp>

                <PageProp key={"blurWidth"} label={"Blur (px)"}>
                    <PageNumberField
                        value={getBlurWidth}
                        min={() => MIN_BLUR_WIDTH}
                        max={() => MAX_BLUR_WIDTH}
                        step={() => BLUR_WIDTH_STEP}
                        ariaLabel={"Blur width"}
                        onInput={setBlurWidth}
                    />
                </PageProp>

                <PageProp key={"animationDurationMs"} label={"Animation duration (ms)"}>
                    <PageNumberField
                        value={getAnimationDurationMs}
                        min={() => MIN_DURATION_MS}
                        max={() => MAX_DURATION_MS}
                        step={() => DURATION_STEP_MS}
                        ariaLabel={"Animation duration"}
                        onInput={setAnimationDurationMs}
                    />
                </PageProp>

                <PageProp key={"iterationConfigKey"} label={"Iteration Pattern"}>
                    <PageSelectField
                        value={getIterationConfigKey}
                        values={() =>
                            Object.keys(
                                SVGDefsSamples.Iteration.SAMPLE_CONFIGS,
                            ) as (keyof typeof SVGDefsSamples.Iteration.SAMPLE_CONFIGS)[]
                        }
                        ariaLabel={"Iteration pattern"}
                        onChange={(config) => setIterationConfigKey(() => config)}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </div>
    );
};
