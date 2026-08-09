import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import type { Point2d } from "@thewaver/ss-utils";

import { ScanlineAnimation } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import type { ScanlineAnimationController } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.types";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import {
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
import { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints.const";
import { CellAnimationWeights } from "../../Samples/CellAnimationWeights.const";
import { ScanlineAnimationKeyframes } from "../../Samples/ScanlineAnimationKeyframes.const";
import knight from "../../knight.png";
import { BrightnessExample } from "./Examples/Brightness";
import BrightnessExampleRaw from "./Examples/Brightness.tsx?raw";
import { GlitchExample } from "./Examples/Glitch";
import GlitchExampleRaw from "./Examples/Glitch.tsx?raw";
import { GrayscaleExample } from "./Examples/Grayscale";
import GrayscaleExampleRaw from "./Examples/Grayscale.tsx?raw";
import { HueExample } from "./Examples/Hue";
import HueExampleRaw from "./Examples/Hue.tsx?raw";
import { SnakeExample } from "./Examples/Snake";
import SnakeExampleRaw from "./Examples/Snake.tsx?raw";
import { SplitExample } from "./Examples/Split";
import SplitExampleRaw from "./Examples/Split.tsx?raw";
import { SurgeExample } from "./Examples/Surge";
import SurgeExampleRaw from "./Examples/Surge.tsx?raw";
import type { ScanlineAnimationExampleProps } from "./ScanlineAnimationPage.types";

import { MEASURE_BOX_PADDING } from "../../PageComponents/MeasureBox/MeasureBox.css";
import * as styles from "./ScanlineAnimationPage.css";

const IMAGE_CONTAINER_SIZE = 240 + MEASURE_BOX_PADDING * 2;
const MIN_SMOOTHNESS = 0.1;
const MAX_SMOOTHNESS = 1;
const SMOOTHNESS_STEP = 0.1;
const MIN_SHIFT_PERCENT = 5;
const MAX_SHIFT_PERCENT = 25;
const SHIFT_PERCENT_STEP = 5;
const MIN_CHUNKYNESS = 0.1;
const MAX_CHUNKYNESS = 1;
const CHUNKYNESS_STEP = 0.1;
const MIN_PEAK_SCALE_PERCENT = 120;
const MAX_PEAK_SCALE_PERCENT = 200;
const PEAK_SCALE_PERCENT_STEP = 10;
const MIN_LINE_COUNT = 8;
const MAX_LINE_COUNT = 240;
const LINE_COUNT_STEP = 4;
const MIN_DURATION_MS = 100;
const MAX_DURATION_MS = 5000;
const DURATION_STEP_MS = 100;
const MIN_ITERATION_DELAY_MS = 0;
const STRESS_LINE_COUNT = 120;
const SCANLINE_ORIGIN: Point2d = { x: 0, y: 0 };
const STRESS_ITEMS: (StressTestDefs & { size: number; kind: "transform" | "filter" })[] = (
    ["transform", "filter"] as const
)
    .map((kind) => [
        {
            count: 8,
            cols: 4,
            gap: 10,
            size: STRESS_LINE_COUNT + MEASURE_BOX_PADDING * 2,
            kind,
        },
        {
            count: 18,
            cols: 6,
            gap: 10,
            size: STRESS_LINE_COUNT + MEASURE_BOX_PADDING * 2,
            kind,
        },
        {
            count: 32,
            cols: 8,
            gap: 10,
            size: STRESS_LINE_COUNT + MEASURE_BOX_PADDING * 2,
            kind,
        },
        {
            count: 50,
            cols: 10,
            gap: 10,
            size: STRESS_LINE_COUNT + MEASURE_BOX_PADDING * 2,
            kind,
        },
    ])
    .flat();

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

const GROUPPED_WEIGHTS = groupOptions(CellAnimationWeights.ORIGIN_FREE_WEIGHT_TYPES);

const GLITCH_SOURCE = highlighter.codeToHtml(GlitchExampleRaw, getDefaultHighlighterConfig());
const SURGE_SOURCE = highlighter.codeToHtml(SurgeExampleRaw, getDefaultHighlighterConfig());
const SNAKE_SOURCE = highlighter.codeToHtml(SnakeExampleRaw, getDefaultHighlighterConfig());
const SPLIT_SOURCE = highlighter.codeToHtml(SplitExampleRaw, getDefaultHighlighterConfig());
const BRIGHTNESS_SOURCE = highlighter.codeToHtml(BrightnessExampleRaw, getDefaultHighlighterConfig());
const GRAYSCALE_SOURCE = highlighter.codeToHtml(GrayscaleExampleRaw, getDefaultHighlighterConfig());
const HUE_SOURCE = highlighter.codeToHtml(HueExampleRaw, getDefaultHighlighterConfig());

const StressTestWrapper = (props: ScanlineAnimationExampleProps & { controllers: ScanlineAnimationController[] }) => {
    return (
        <>
            <div>{"120 lines"}</div>

            <StressTest
                getConfigs={() => STRESS_ITEMS}
                onHideModal={() => {
                    props.controllers.forEach((c) => c.start());
                }}
                onShowModal={() => {
                    props.controllers.forEach((c) => c.stop());
                }}
                renderLabel={(getConfigIndex) =>
                    `Render ${STRESS_ITEMS[getConfigIndex()].count} ${STRESS_ITEMS[getConfigIndex()].kind} items`
                }
                renderItem={(getConfigIndex) => {
                    const random = Math.random() * 3;
                    const foo =
                        STRESS_ITEMS[getConfigIndex()].kind === "transform"
                            ? random < 1
                                ? ScanlineAnimationKeyframes.computeHorizontalSnake
                                : random < 2
                                  ? ScanlineAnimationKeyframes.computeHorizontalSplit
                                  : ScanlineAnimationKeyframes.computeHorizontalStretch
                            : random < 1
                              ? ScanlineAnimationKeyframes.computeHorizontalBrightness
                              : random < 2
                                ? ScanlineAnimationKeyframes.computeHorizontalHue
                                : ScanlineAnimationKeyframes.computeHorizontalGrayscale;

                    return (
                        <PageMeasureBox
                            getWidth={() => STRESS_ITEMS[getConfigIndex()].size}
                            getHeight={() => STRESS_ITEMS[getConfigIndex()].size}
                        >
                            <ScanlineAnimation
                                {...props}
                                getLineCount={() => STRESS_LINE_COUNT}
                                getAnimationIterationDelayMs={() => 0}
                                computeScanlineAnimation={(defs, timeline) =>
                                    foo(
                                        CellAnimationBreakpoints.computeBreakpoints(defs.weight, undefined),
                                        defs,
                                        timeline,
                                        undefined,
                                    )
                                }
                            />
                        </PageMeasureBox>
                    );
                }}
            />
        </>
    );
};

const SmoothnessInput = (props: { getter: () => number; setter: (value: number) => void }) => {
    return (
        <PageProp getLabel={() => "Smoothness (0-1)"}>
            <PageNumberField
                getValue={props.getter}
                getMin={() => MIN_SMOOTHNESS}
                getMax={() => MAX_SMOOTHNESS}
                getStep={() => SMOOTHNESS_STEP}
                getAriaLabel={() => "Smoothness"}
                onInput={props.setter}
            />
        </PageProp>
    );
};

const DirInput = (props: {
    getter: () => CellAnimationBreakpoints.Direction;
    setter: (value: CellAnimationBreakpoints.Direction) => void;
}) => {
    return (
        <PageProp getLabel={() => "Direction"}>
            <PageSelectField
                getValue={props.getter}
                getValues={() => CellAnimationBreakpoints.DIRECTIONS}
                getAriaLabel={() => "Direction"}
                onChange={props.setter}
            />
        </PageProp>
    );
};

const GlitchExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts, setKeyframeOpts] = createStore({
        shiftPercent: 10,
        chunkyness: 0.8,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <GlitchExample {...props} getKeyframeOpts={() => keyframeOpts} />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Max shift (%)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.shiftPercent!}
                        getMin={() => MIN_SHIFT_PERCENT}
                        getMax={() => MAX_SHIFT_PERCENT}
                        getStep={() => SHIFT_PERCENT_STEP}
                        getAriaLabel={() => "Shift percent"}
                        onInput={(value) => setKeyframeOpts("shiftPercent", value)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Chunkyness (0-1)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.chunkyness}
                        getMin={() => MIN_CHUNKYNESS}
                        getMax={() => MAX_CHUNKYNESS}
                        getStep={() => CHUNKYNESS_STEP}
                        getAriaLabel={() => "Chunkyness"}
                        onInput={(value) => setKeyframeOpts("chunkyness", value)}
                    />
                </PageProp>
            </PagePropsPanel>
        </>
    );
};

const SurgeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalStretchOpts>({
        peakScalePercent: 150,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.2,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <SurgeExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Peak Scale (%)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.peakScalePercent!}
                        getMin={() => MIN_PEAK_SCALE_PERCENT}
                        getMax={() => MAX_PEAK_SCALE_PERCENT}
                        getStep={() => PEAK_SCALE_PERCENT_STEP}
                        getAriaLabel={() => "Peak scale percent"}
                        onInput={(value) => setKeyframeOpts("peakScalePercent", value)}
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

const SnakeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalSnakeOpts>({
        shiftPercent: 5,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.2,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <SnakeExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Shift (%)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.shiftPercent!}
                        getMin={() => MIN_SHIFT_PERCENT}
                        getMax={() => MAX_SHIFT_PERCENT}
                        getStep={() => SHIFT_PERCENT_STEP}
                        getAriaLabel={() => "Shift percent"}
                        onInput={(value) => setKeyframeOpts("shiftPercent", value)}
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

const SplitExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalSplitOpts>({
        shiftPercent: 10,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 1,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <SplitExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Shift (%)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.shiftPercent!}
                        getMin={() => MIN_SHIFT_PERCENT}
                        getMax={() => MAX_SHIFT_PERCENT}
                        getStep={() => SHIFT_PERCENT_STEP}
                        getAriaLabel={() => "Shift percent"}
                        onInput={(value) => setKeyframeOpts("shiftPercent", value)}
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

const BrightnessExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalBrightnessOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <BrightnessExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

const GrayscaleExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalGrayscaleOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <GrayscaleExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

const HueExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalHueOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<CellAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <HueExample {...props} getKeyframeOpts={() => keyframeOpts} getBreakpointOpts={() => breakpointOpts} />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
            </PagePropsPanel>
        </>
    );
};

export const ScanlineAnimationPage = () => {
    let controllers: ScanlineAnimationController[] = [];

    const [getSrc, setSrc] = createSignal(knight);
    const [getLineCount, setLineCount] = createSignal(120);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);
    const [getWeightType, setWeightType] = createSignal<CellAnimationWeights.OriginFreeWeightType>("sequenceLinear");

    const handleFile = (file: File) => {
        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        controllers = [];

        const commonProps: ScanlineAnimationExampleProps = {
            onMount: (controller) => {
                controllers.push(controller);
            },
            computeCellWeights: (count) =>
                CellAnimationWeights.computeCellWeights(getWeightType(), count, SCANLINE_ORIGIN),
            getSrc,
            getLineCount,
            getAnimationDurationMs,
            getAnimationIterationDelayMs,
        };

        return [
            {
                name: "Glitch",
                component: () => <GlitchExampleWrapper {...commonProps} />,
                src: GLITCH_SOURCE,
            },
            {
                name: "Surge",
                component: () => <SurgeExampleWrapper {...commonProps} />,
                src: SURGE_SOURCE,
            },
            {
                name: "Snake",
                component: () => <SnakeExampleWrapper {...commonProps} />,
                src: SNAKE_SOURCE,
            },
            {
                name: "Split",
                component: () => <SplitExampleWrapper {...commonProps} />,
                src: SPLIT_SOURCE,
            },
            {
                name: "Brightness",
                component: () => <BrightnessExampleWrapper {...commonProps} />,
                src: BRIGHTNESS_SOURCE,
            },
            {
                name: "Grayscale",
                component: () => <GrayscaleExampleWrapper {...commonProps} />,
                src: GRAYSCALE_SOURCE,
            },
            {
                name: "Hue",
                component: () => <HueExampleWrapper {...commonProps} />,
                src: HUE_SOURCE,
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

                <PageProp getLabel={() => "Weight"}>
                    <PageGroupedSelectField
                        getValue={getWeightType}
                        getGroups={() => GROUPPED_WEIGHTS}
                        getAriaLabel={() => "Weight"}
                        onChange={(weight) => setWeightType(() => weight)}
                    />
                </PageProp>

                <PageProp getLabel={() => "Line count"}>
                    <PageNumberField
                        getValue={getLineCount}
                        getMin={() => MIN_LINE_COUNT}
                        getMax={() => MAX_LINE_COUNT}
                        getStep={() => LINE_COUNT_STEP}
                        getAriaLabel={() => "Line count"}
                        onInput={setLineCount}
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
                        getMax={() => MAX_DURATION_MS}
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
