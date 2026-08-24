import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { Point2d } from "@thewaver/ss-utils";

import { access } from "../../../../Lib/Utils/propUtils";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationKeyframes } from "../../Samples/CellAnimationKeyframes/CellAnimationKeyframes.const";
import { CellAnimationOrigins } from "../../Samples/CellAnimationOrigins/CellAnimationOrigins.const";
import { CellAnimationWeights } from "../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import type { WeightOpts } from "../../Samples/CellAnimationWeights/CellAnimationWeights.types";
import { SVGDefsSamples } from "../../Samples/SVGDefs/SVGDefs.const";
import { SVGDefsSources } from "../../Samples/SVGDefs/SVGDefsSources.const";
import {
    PageCheckField,
    PageFileField,
    PageGroupedSelectField,
    PageNumberField,
    PageSelectField,
} from "../../StyledComponents/Field/Field";
import knight_profile from "../../knight_profile.webp";
import type { CellAnimationExampleProps, CellAnimationSourcedExampleProps } from "./CellAnimationPage.types";
import { DefaultExample } from "./Examples/Default";

import * as styles from "./CellAnimationPage.css";

const IMAGE_CONTAINER_SIZE = 480;
const STRESS_CELL_COUNT: Point2d = { x: 11, y: 11 };
const STRESS_ITEM_SIZE = 120;
const STRESS_ITEMS: (StressTestDefs & { size: number })[] = [
    {
        count: 4 * 3,
        cols: 4,
        gap: 10,
        size: STRESS_ITEM_SIZE,
    },
    {
        count: 6 * 4,
        cols: 6,
        gap: 10,
        size: STRESS_ITEM_SIZE,
    },
    {
        count: 8 * 6,
        cols: 8,
        gap: 10,
        size: STRESS_ITEM_SIZE,
    },
    {
        count: 12 * 6,
        cols: 12,
        gap: 10,
        size: STRESS_ITEM_SIZE,
    },
];

const DEFAULT_EXAMPLE_PATH = "/src/Playground/App/Pages/CellAnimationPage/Examples/Default.tsx";
const DRAWN_SOURCE_PATH = "/src/Playground/App/Samples/SVGDefs/SVGDefsSources.const.ts";

const MIN_CELL_COUNT = 1;
const MAX_CELL_COUNT = 40;
const CELL_COUNT_STEP = 1;
const MIN_SMOOTHNESS = 0.05;
const MAX_SMOOTHNESS = 1;
const SMOOTHNESS_STEP = 0.05;
const MIN_DURATION_MS = 100;
const MAX_DURATION_MS = 10000;
const DURATION_STEP_MS = 100;
const MIN_ITERATION_DELAY_MS = 0;
const MAX_ITERATION_DELAY_MS = 5000;

const extractOptionGroupWord = (key: string) => key.replace(/^_/, "").match(/^[a-z]+/)?.[0] ?? key;

const groupOptions = <T extends string>(keys: readonly T[]) => {
    const result: Record<string, T[]> = {};

    for (const key of keys) {
        const group = extractOptionGroupWord(key);

        result[group] ??= [];
        result[group].push(key);
    }

    return Object.entries(result);
};

const GROUPPED_WEIGHTS = groupOptions(CellAnimationWeights.WEIGHT_TYPES);
const GROUPPED_ANIMATIONS = groupOptions(CellAnimationKeyframes.ANIMATION_TYPES);

const ImageExampleWrapper = (props: CellAnimationExampleProps) => {
    const [getSrc, setSrc] = createSignal(knight_profile);

    return (
        <>
            <div class={styles.exampleRoot}>
                <PageMeasureBox width={() => IMAGE_CONTAINER_SIZE}>
                    <DefaultExample {...props} src={getSrc} />
                </PageMeasureBox>
            </div>

            <PagePropsPanel scope={"local"}>
                <PageProp key={"image"} label={"Image"}>
                    <PageFileField
                        accept={"image/*"}
                        ariaLabel={"Image"}
                        onPick={(file) => setSrc(URL.createObjectURL(file))}
                    />
                </PageProp>
            </PagePropsPanel>
        </>
    );
};

const GradientExampleWrapper = (props: CellAnimationExampleProps) => {
    const [getKey, setKey] = createSignal<SVGDefsSamples.Gradient.SampleKey>("orbit_1");

    return (
        <>
            <div class={styles.exampleRoot}>
                <PageMeasureBox width={() => IMAGE_CONTAINER_SIZE}>
                    <DefaultExample
                        {...props}
                        src={() =>
                            SVGDefsSources.computeGradientSource(
                                getKey(),
                                access(props.animationDurationMs),
                                access(props.animationIterationDelayMs),
                            )
                        }
                    />
                </PageMeasureBox>
            </div>

            <PagePropsPanel scope={"local"}>
                <PageProp key={"gradient"} label={"Gradient"}>
                    <PageSelectField
                        value={getKey}
                        values={() => SVGDefsSources.GRADIENT_KEYS}
                        ariaLabel={"Gradient"}
                        onChange={(key) => setKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>
        </>
    );
};

const PatternExampleWrapper = (props: CellAnimationExampleProps) => {
    const [getKey, setKey] = createSignal<SVGDefsSamples.Pattern.SampleKey>("hexagon_pt_2");

    return (
        <>
            <div class={styles.exampleRoot}>
                <PageMeasureBox width={() => IMAGE_CONTAINER_SIZE}>
                    <DefaultExample
                        {...props}
                        src={() => SVGDefsSources.computePatternSource(getKey(), access(props.animationDurationMs))}
                    />
                </PageMeasureBox>
            </div>

            <PagePropsPanel scope={"local"}>
                <PageProp key={"pattern"} label={"Pattern"}>
                    <PageSelectField
                        value={getKey}
                        values={() => SVGDefsSources.PATTERN_KEYS}
                        ariaLabel={"Pattern"}
                        onChange={(key) => setKey(() => key)}
                    />
                </PageProp>
            </PagePropsPanel>
        </>
    );
};

const StressTestWrapper = (props: CellAnimationSourcedExampleProps) => {
    const modalPlayback = createSignal(true);

    return (
        <>
            <div>{`${STRESS_CELL_COUNT.x} x ${STRESS_CELL_COUNT.y} cells`}</div>

            <StressTest
                configs={() => STRESS_ITEMS}
                onHideModal={() => {
                    props.playbackSignal[1](true);
                }}
                onShowModal={() => {
                    props.playbackSignal[1](false);
                }}
                renderLabel={(getConfigIndex) => `Render ${STRESS_ITEMS[getConfigIndex()].count} items`}
                renderItem={(getConfigIndex) => (
                    <PageMeasureBox
                        width={() => STRESS_ITEMS[getConfigIndex()].size}
                        height={() => STRESS_ITEMS[getConfigIndex()].size}
                    >
                        <DefaultExample {...props} playbackSignal={modalPlayback} cellCount={() => STRESS_CELL_COUNT} />
                    </PageMeasureBox>
                )}
            />
        </>
    );
};

export const CellAnimationPage = () => {
    const playback = createSignal(true);

    const [getOriginType, setOriginType] = createSignal<CellAnimationOrigins.OriginType>("center");
    const [getWeightType, setWeightType] = createSignal<CellAnimationWeights.WeightType>("circularDefault");
    const [getAnimationType, setAnimationType] = createSignal<CellAnimationKeyframes.AnimationType>("zoomIn");
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);
    const [cellCount, setCellCount] = createStore<Point2d>({ ...STRESS_CELL_COUNT });
    const [weightOpts, setWeightOpts] = createStore<WeightOpts>({
        shouldMakeUnique: false,
        shouldNormalize: false,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.25,
        easing: "linear",
    });

    const getExamples = createMemo(() => {
        const commonProps: CellAnimationExampleProps = {
            playbackSignal: playback,
            cellCount: () => cellCount,
            originType: getOriginType,
            weightType: getWeightType,
            weightOpts: () => weightOpts,
            breakpointOpts: () => breakpointOpts,
            animationType: getAnimationType,
            animationDurationMs: getAnimationDurationMs,
            animationIterationDelayMs: getAnimationIterationDelayMs,
        };

        return [
            {
                key: "image",
                name: "A photograph, sliced",
                component: () => <ImageExampleWrapper {...commonProps} />,
                path: DEFAULT_EXAMPLE_PATH,
                sampleKeys: () => [getAnimationType(), getWeightType()],
            },
            {
                key: "gradient",
                name: "A gradient, drawn in place",
                readout: () =>
                    "the Shape page's own gradients, serialised into a source — the start and the pause a script would have timed are written into the markup instead, so they run at the same length and rhythm as the cells",
                component: () => <GradientExampleWrapper {...commonProps} />,
                path: DRAWN_SOURCE_PATH,
                sampleKeys: () => [getAnimationType(), getWeightType()],
            },
            {
                key: "pattern",
                name: "A pattern, drawn in place",
                readout: () =>
                    "the same for the patterns, which flow on without a pause — a repeating fill has no beat to be out of step with",
                component: () => <PatternExampleWrapper {...commonProps} />,
                path: DRAWN_SOURCE_PATH,
                sampleKeys: () => [getAnimationType(), getWeightType()],
            },
            {
                key: "stressTest",
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} src={() => knight_profile} />,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel scope={"global"}>
                <PageProp key={"cellCountCols"} label={"Cell count (cols x rows)"}>
                    <div class={styles.valueList}>
                        <PageNumberField
                            value={() => cellCount.x}
                            min={() => MIN_CELL_COUNT}
                            max={() => MAX_CELL_COUNT}
                            step={() => CELL_COUNT_STEP}
                            ariaLabel={"Columns"}
                            onInput={(value) => setCellCount("x", value)}
                        />
                        <PageNumberField
                            value={() => cellCount.y}
                            min={() => MIN_CELL_COUNT}
                            max={() => MAX_CELL_COUNT}
                            step={() => CELL_COUNT_STEP}
                            ariaLabel={"Rows"}
                            onInput={(value) => setCellCount("y", value)}
                        />
                    </div>
                </PageProp>

                <PageProp key={"originType"} label={"Origin"}>
                    <PageSelectField
                        value={getOriginType}
                        values={() => CellAnimationOrigins.ORIGIN_TYPES}
                        isDisabled={() => !CellAnimationWeights.isOriginAware(getWeightType())}
                        ariaLabel={"Origin"}
                        onChange={(origin) => setOriginType(() => origin)}
                    />
                </PageProp>

                <PageProp key={"weightType"} label={"Weight"}>
                    <PageGroupedSelectField
                        value={getWeightType}
                        groups={() => GROUPPED_WEIGHTS}
                        ariaLabel={"Weight"}
                        onChange={(weight) => setWeightType(() => weight)}
                    />
                </PageProp>

                <PageProp key={"uniqueWeights"} label={"Unique weights"}>
                    <PageCheckField
                        value={() => !!weightOpts.shouldMakeUnique}
                        ariaLabel={"Unique weights"}
                        onChange={(value) => setWeightOpts("shouldMakeUnique", value)}
                    />
                </PageProp>

                <PageProp key={"normalizeWeights"} label={"Normalize weights"}>
                    <PageCheckField
                        value={() => !!weightOpts.shouldNormalize}
                        ariaLabel={"Normalize weights"}
                        onChange={(value) => setWeightOpts("shouldNormalize", value)}
                    />
                </PageProp>

                <PageProp key={"animationType"} label={"Animation"}>
                    <PageGroupedSelectField
                        value={getAnimationType}
                        groups={() => GROUPPED_ANIMATIONS}
                        ariaLabel={"Animation"}
                        onChange={(anim) => setAnimationType(() => anim)}
                    />
                </PageProp>

                <PageProp key={"direction"} label={"Direction"}>
                    <PageSelectField
                        value={() => breakpointOpts.dir!}
                        values={() => CellAnimationBreakpoints.DIRECTIONS}
                        ariaLabel={"Direction"}
                        onChange={(dir) => setBreakpointOpts("dir", dir)}
                    />
                </PageProp>

                <PageProp key={"easing"} label={"Easing"}>
                    <PageSelectField
                        value={() => breakpointOpts.easing!}
                        values={() => CellAnimationBreakpoints.EASINGS}
                        ariaLabel={"Easing"}
                        onChange={(easing) => setBreakpointOpts("easing", easing)}
                    />
                </PageProp>

                <PageProp key={"smoothness01"} label={"Smoothness (0-1)"}>
                    <PageNumberField
                        value={() => breakpointOpts.smoothness!}
                        min={() => MIN_SMOOTHNESS}
                        max={() => MAX_SMOOTHNESS}
                        step={() => SMOOTHNESS_STEP}
                        ariaLabel={"Smoothness"}
                        onInput={(value) => setBreakpointOpts("smoothness", value)}
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

                <PageProp key={"animationIterationDelayMs"} label={"Iteration delay (ms)"}>
                    <PageNumberField
                        value={getAnimationIterationDelayMs}
                        min={() => MIN_ITERATION_DELAY_MS}
                        max={() => MAX_ITERATION_DELAY_MS}
                        step={() => DURATION_STEP_MS}
                        ariaLabel={"Iteration delay"}
                        onInput={setAnimationIterationDelayMs}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples items={getExamples} layout={"flow"} />
        </div>
    );
};
