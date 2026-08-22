import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { ScanlineAnimation } from "../../../../Lib/Exotics/ScanlineAnimation/ScanlineAnimation";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { CellAnimationBreakpoints } from "../../Samples/CellAnimationBreakpoints/CellAnimationBreakpoints.const";
import { CellAnimationWeights } from "../../Samples/CellAnimationWeights/CellAnimationWeights.const";
import { ScanlineAnimationKeyframes } from "../../Samples/ScanlineAnimationKeyframes/ScanlineAnimationKeyframes.const";
import {
    PageFileField,
    PageGroupedSelectField,
    PageNumberField,
    PageSelectField,
} from "../../StyledComponents/Field/Field";
import knight from "../../knight.webp";
import { BrightnessExample } from "./Examples/Brightness";
import { GlitchExample } from "./Examples/Glitch";
import { GrayscaleExample } from "./Examples/Grayscale";
import { HueExample } from "./Examples/Hue";
import { SnakeExample } from "./Examples/Snake";
import { SplitExample } from "./Examples/Split";
import { SurgeExample } from "./Examples/Surge";
import type { ScanlineAnimationExampleProps } from "./ScanlineAnimationPage.types";

import * as styles from "./ScanlineAnimationPage.css";

const IMAGE_CONTAINER_SIZE = 360;
const MIN_GLITCH_COUNT = 1;
const MAX_GLITCH_COUNT = 10;
const GLITCH_COUNT_STEP = 1;
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
const STRESS_ITEMS: (StressTestDefs & { size: number; kind: "transform" | "filter" })[] = (
    ["transform", "filter"] as const
)
    .map((kind) => [
        {
            count: 4 * 3,
            cols: 4,
            gap: 10,
            size: STRESS_LINE_COUNT,
            kind,
        },
        {
            count: 6 * 4,
            cols: 6,
            gap: 10,
            size: STRESS_LINE_COUNT,
            kind,
        },
        {
            count: 8 * 6,
            cols: 8,
            gap: 10,
            size: STRESS_LINE_COUNT,
            kind,
        },
        {
            count: 12 * 6,
            cols: 12,
            gap: 10,
            size: STRESS_LINE_COUNT,
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
const EXAMPLES_ROOT = "/src/Playground/App/Pages/ScanLineAnimationPage/Examples";
const WEIGHT_ORIGIN = { x: 0, y: 0 };

const StressTestWrapper = (props: ScanlineAnimationExampleProps) => {
    const modalPlayback = createSignal(true);

    return (
        <>
            <div>{"120 lines"}</div>

            <StressTest
                getConfigs={() => STRESS_ITEMS}
                onHideModal={() => {
                    props.playbackSignal[1](true);
                }}
                onShowModal={() => {
                    props.playbackSignal[1](false);
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
                                playbackSignal={modalPlayback}
                                getLineCount={() => STRESS_LINE_COUNT}
                                getAnimationIterationDelayMs={() => 0}
                                computeCellWeights={(count) =>
                                    CellAnimationWeights.computeCellWeights(props.getWeightType(), count, WEIGHT_ORIGIN)
                                }
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
        <PageProp getKey={() => "smoothness01"} getLabel={() => "Smoothness (0-1)"}>
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
        <PageProp getKey={() => "direction"} getLabel={() => "Direction"}>
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
        count: 3,
        shiftPercent: 10,
        chunkyness: 0.8,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <GlitchExample {...props} getKeyframeOpts={() => keyframeOpts} />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getKey={() => "count"} getLabel={() => "Count"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.count!}
                        getMin={() => MIN_GLITCH_COUNT}
                        getMax={() => MAX_GLITCH_COUNT}
                        getStep={() => GLITCH_COUNT_STEP}
                        getAriaLabel={() => "Count"}
                        onInput={(value) => setKeyframeOpts("count", value)}
                    />
                </PageProp>

                <PageProp getKey={() => "maxShift"} getLabel={() => "Max shift (%)"}>
                    <PageNumberField
                        getValue={() => keyframeOpts.shiftPercent!}
                        getMin={() => MIN_SHIFT_PERCENT}
                        getMax={() => MAX_SHIFT_PERCENT}
                        getStep={() => SHIFT_PERCENT_STEP}
                        getAriaLabel={() => "Shift percent"}
                        onInput={(value) => setKeyframeOpts("shiftPercent", value)}
                    />
                </PageProp>

                <PageProp getKey={() => "chunkyness01"} getLabel={() => "Chunkyness (0-1)"}>
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
                <PageProp getKey={() => "peakScale"} getLabel={() => "Peak Scale (%)"}>
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
                <PageProp getKey={() => "shift"} getLabel={() => "Shift (%)"}>
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
                <PageProp getKey={() => "shift"} getLabel={() => "Shift (%)"}>
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
    const playback = createSignal(true);

    const [getSrc, setSrc] = createSignal(knight);
    const [getLineCount, setLineCount] = createSignal(120);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);
    const [getWeightType, setWeightType] = createSignal<CellAnimationWeights.OriginFreeWeightType>("sequenceLinear");

    const handleFile = (file: File) => {
        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        const commonProps: ScanlineAnimationExampleProps = {
            playbackSignal: playback,
            getSrc,
            getLineCount,
            getWeightType,
            getAnimationDurationMs,
            getAnimationIterationDelayMs,
        };

        return [
            {
                key: "glitch",
                name: "Glitch",
                component: () => <GlitchExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Glitch.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "surge",
                name: "Surge",
                component: () => <SurgeExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Surge.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "snake",
                name: "Snake",
                component: () => <SnakeExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Snake.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "split",
                name: "Split",
                component: () => <SplitExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Split.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "brightness",
                name: "Brightness",
                component: () => <BrightnessExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Brightness.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "grayscale",
                name: "Grayscale",
                component: () => <GrayscaleExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Grayscale.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "hue",
                name: "Hue",
                component: () => <HueExampleWrapper {...commonProps} />,
                path: `${EXAMPLES_ROOT}/Hue.tsx`,
                sampleKeys: () => [getWeightType()],
            },
            {
                key: "stressTest",
                name: "Stress Test",
                component: () => <StressTestWrapper {...commonProps} />,
            },
        ];
    });

    return (
        <div class={styles.root}>
            <PagePropsPanel getScope={() => "global"}>
                <PageProp getKey={() => "image"} getLabel={() => "Image"}>
                    <PageFileField getAccept={() => "image/*"} getAriaLabel={() => "Image"} onPick={handleFile} />
                </PageProp>

                <PageProp getKey={() => "weightType"} getLabel={() => "Weight"}>
                    <PageGroupedSelectField
                        getValue={getWeightType}
                        getGroups={() => GROUPPED_WEIGHTS}
                        getAriaLabel={() => "Weight"}
                        onChange={(weight) => setWeightType(() => weight)}
                    />
                </PageProp>

                <PageProp getKey={() => "lineCount"} getLabel={() => "Line count"}>
                    <PageNumberField
                        getValue={getLineCount}
                        getMin={() => MIN_LINE_COUNT}
                        getMax={() => MAX_LINE_COUNT}
                        getStep={() => LINE_COUNT_STEP}
                        getAriaLabel={() => "Line count"}
                        onInput={setLineCount}
                    />
                </PageProp>

                <PageProp getKey={() => "animationDurationMs"} getLabel={() => "Animation duration (ms)"}>
                    <PageNumberField
                        getValue={getAnimationDurationMs}
                        getMin={() => MIN_DURATION_MS}
                        getMax={() => MAX_DURATION_MS}
                        getStep={() => DURATION_STEP_MS}
                        getAriaLabel={() => "Animation duration"}
                        onInput={setAnimationDurationMs}
                    />
                </PageProp>

                <PageProp getKey={() => "animationIterationDelayMs"} getLabel={() => "Iteration delay (ms)"}>
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

            <PageExamples getItems={getExamples} getLayout={() => "flow"} />
        </div>
    );
};
