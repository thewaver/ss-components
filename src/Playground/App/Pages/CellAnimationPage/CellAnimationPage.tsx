import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { Point2d } from "@thewaver/ss-utils";

import type { CellAnimationController } from "../../../../Lib/Exotics/CellAnimation/CellAnimation.types";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import {
    PageCheckField,
    PageFileField,
    PageGroupedSelectField,
    PageNumberField,
    PageSelectField,
} from "../../PageComponents/Field/Field";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { CellAnimationKeyframes } from "../../Samples/CellAnimation.const";
import { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints.const";
import { CellAnimationOrigins } from "../../Samples/CellAnimationOrigins.const";
import { CellAnimationWeights } from "../../Samples/CellAnimationWeights.const";
import knight_profile from "../../knight_profile.webp";
import type { CellAnimationExampleProps } from "./CellAnimationPage.types";
import { DefaultExample } from "./Examples/Default";
import DefaultExampleRaw from "./Examples/Default.tsx?raw";

import { MEASURE_BOX_PADDING } from "../../PageComponents/MeasureBox/MeasureBox.css";
import * as styles from "./CellAnimationPage.css";

const IMAGE_CONTAINER_SIZE = 480 + MEASURE_BOX_PADDING * 2;
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

const DEFAULT_SOURCE = highlighter.codeToHtml(DefaultExampleRaw, getDefaultHighlighterConfig());

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

const extractOptionGroupWord = (key: string) => key.match(/^[a-z]+/)?.[0] ?? key;

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

const DefaultExampleWrapper = (props: CellAnimationExampleProps) => {
    return (
        <div class={styles.exampleRoot}>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <DefaultExample {...props} />
            </PageMeasureBox>
        </div>
    );
};

const StressTestWrapper = (props: CellAnimationExampleProps & { controllers: CellAnimationController[] }) => {
    return (
        <>
            <div>{`${STRESS_CELL_COUNT.x} x ${STRESS_CELL_COUNT.y} cells`}</div>

            <StressTest
                getConfigs={() => STRESS_ITEMS}
                onHideModal={() => {
                    props.controllers.forEach((c) => c.start());
                }}
                onShowModal={() => {
                    props.controllers.forEach((c) => c.stop());
                }}
                renderLabel={(getConfigIndex) => `Render ${STRESS_ITEMS[getConfigIndex()].count} items`}
                renderItem={(getConfigIndex) => (
                    <PageMeasureBox
                        getWidth={() => STRESS_ITEMS[getConfigIndex()].size}
                        getHeight={() => STRESS_ITEMS[getConfigIndex()].size}
                        getPadding={() => 0}
                    >
                        <DefaultExample {...props} getCellCount={() => STRESS_CELL_COUNT} />
                    </PageMeasureBox>
                )}
            />
        </>
    );
};

export const CellAnimationPage = () => {
    let controllers: CellAnimationController[] = [];

    const [getSrc, setSrc] = createSignal(knight_profile);
    const [getOriginType, setOriginType] = createSignal<CellAnimationOrigins.OriginType>("center");
    const [getWeightType, setWeightType] = createSignal<CellAnimationWeights.WeightType>("circularDefault");
    const [getAnimationType, setAnimationType] = createSignal<CellAnimationKeyframes.AnimationType>("zoomIn");
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);
    const [cellCount, setCellCount] = createStore<Point2d>({ ...STRESS_CELL_COUNT });
    const [weightOpts, setWeightOpts] = createStore<CellAnimationWeights.WeightOpts>({
        shouldMakeUnique: false,
        shouldNormalize: false,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.25,
    });

    const getOrigin = createMemo(() => CellAnimationOrigins.computeOrigin(getOriginType(), cellCount));

    const handleFile = (file: File) => {
        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        controllers = [];

        const commonProps: CellAnimationExampleProps = {
            onMount: (controller) => {
                controllers.push(controller);
            },
            computeCellWeights: (count) =>
                CellAnimationWeights.computeCellWeights(getWeightType(), count, getOrigin(), weightOpts),
            getSrc,
            getCellCount: () => cellCount,
            getOrigin,
            getBreakpointOpts: () => breakpointOpts,
            getAnimationType,
            getAnimationDurationMs,
            getAnimationIterationDelayMs,
        };

        return [
            {
                name: "Default",
                component: () => <DefaultExampleWrapper {...commonProps} />,
                src: DEFAULT_SOURCE,
            },
            {
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} controllers={controllers} />,
                src: "",
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getLabel={() => "Image"}>
                    <PageFileField getAccept={() => "image/*"} getAriaLabel={() => "Image"} onPick={handleFile} />
                </PageProp>

                <PageProp getLabel={() => "Cell count (cols x rows)"}>
                    <div class={styles.valueList}>
                        <PageNumberField
                            getValue={() => cellCount.x}
                            getMin={() => MIN_CELL_COUNT}
                            getMax={() => MAX_CELL_COUNT}
                            getStep={() => CELL_COUNT_STEP}
                            getAriaLabel={() => "Columns"}
                            onInput={(value) => setCellCount("x", value)}
                        />
                        <PageNumberField
                            getValue={() => cellCount.y}
                            getMin={() => MIN_CELL_COUNT}
                            getMax={() => MAX_CELL_COUNT}
                            getStep={() => CELL_COUNT_STEP}
                            getAriaLabel={() => "Rows"}
                            onInput={(value) => setCellCount("y", value)}
                        />
                    </div>
                </PageProp>

                <PageProp getLabel={() => "Origin"}>
                    <PageSelectField
                        getValue={getOriginType}
                        getValues={() => CellAnimationOrigins.ORIGIN_TYPES}
                        getIsDisabled={() => !CellAnimationWeights.isOriginAware(getWeightType())}
                        getAriaLabel={() => "Origin"}
                        onChange={(origin) => setOriginType(() => origin)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Weight"}>
                    <PageGroupedSelectField
                        getValue={getWeightType}
                        getGroups={() => GROUPPED_WEIGHTS}
                        getAriaLabel={() => "Weight"}
                        onChange={(weight) => setWeightType(() => weight)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Unique weights"}>
                    <PageCheckField
                        getValue={() => !!weightOpts.shouldMakeUnique}
                        getAriaLabel={() => "Unique weights"}
                        onChange={(value) => setWeightOpts("shouldMakeUnique", value)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Normalize weights"}>
                    <PageCheckField
                        getValue={() => !!weightOpts.shouldNormalize}
                        getAriaLabel={() => "Normalize weights"}
                        onChange={(value) => setWeightOpts("shouldNormalize", value)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation"}>
                    <PageGroupedSelectField
                        getValue={getAnimationType}
                        getGroups={() => GROUPPED_ANIMATIONS}
                        getAriaLabel={() => "Animation"}
                        onChange={(anim) => setAnimationType(() => anim)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Direction"}>
                    <PageSelectField
                        getValue={() => breakpointOpts.dir!}
                        getValues={() => CellAnimationBreakpoints.DIRECTIONS}
                        getAriaLabel={() => "Direction"}
                        onChange={(dir) => setBreakpointOpts("dir", dir)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Smoothness (0-1)"}>
                    <PageNumberField
                        getValue={() => breakpointOpts.smoothness!}
                        getMin={() => MIN_SMOOTHNESS}
                        getMax={() => MAX_SMOOTHNESS}
                        getStep={() => SMOOTHNESS_STEP}
                        getAriaLabel={() => "Smoothness"}
                        onInput={(value) => setBreakpointOpts("smoothness", value)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation duration (ms)"}>
                    <PageNumberField
                        getValue={getAnimationDurationMs}
                        getMin={() => MIN_DURATION_MS}
                        getMax={() => MAX_DURATION_MS}
                        getStep={() => DURATION_STEP_MS}
                        getAriaLabel={() => "Animation duration"}
                        onInput={setAnimationDurationMs}
                    />
                </PageProp>

                <PageProp getLabel={() => "Iteration delay (ms)"}>
                    <PageNumberField
                        getValue={getAnimationIterationDelayMs}
                        getMin={() => MIN_ITERATION_DELAY_MS}
                        getMax={() => MAX_ITERATION_DELAY_MS}
                        getStep={() => DURATION_STEP_MS}
                        getAriaLabel={() => "Iteration delay"}
                        onInput={setAnimationIterationDelayMs}
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
