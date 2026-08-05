import { For, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { ScanlineAnimation } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation";
import type { ScanlineAnimationController } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.types";
import { ScanlineAnimationBreakpoints } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { PageMeasureBox } from "../../PageComponents/MeasureBox/MeasureBox";
import { PageProp } from "../../PageComponents/Prop/Prop";
import { PagePropsPanel } from "../../PageComponents/PropsPanel/PropsPanel";
import { StressTest } from "../../PageComponents/StressTest/StressTest";
import type { StressTestDefs } from "../../PageComponents/StressTest/StressText.types";
import { ScanlineAnimationKeyframesConst } from "../../Samples/ScanlineAnimation.const";
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
const STRESS_LINE_COUNT = 120;
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
                                ? ScanlineAnimationKeyframesConst.computeHorizontalSnake
                                : random < 2
                                  ? ScanlineAnimationKeyframesConst.computeHorizontalSplit
                                  : ScanlineAnimationKeyframesConst.computeHorizontalStretch
                            : random < 1
                              ? ScanlineAnimationKeyframesConst.computeHorizontalBrightness
                              : random < 2
                                ? ScanlineAnimationKeyframesConst.computeHorizontalHue
                                : ScanlineAnimationKeyframesConst.computeHorizontalGrayscale;

                    return (
                        <PageMeasureBox
                            getWidth={() => STRESS_ITEMS[getConfigIndex()].size}
                            getHeight={() => STRESS_ITEMS[getConfigIndex()].size}
                        >
                            <ScanlineAnimation
                                {...props}
                                getLineCount={() => STRESS_LINE_COUNT}
                                getAnimationIterationDelayMs={() => 0}
                                computeScanlineAnimation={(index, lineCount, timeline) =>
                                    foo(
                                        ScanlineAnimationBreakpoints.computeBreakpoints(
                                            props.getOrder(),
                                            index,
                                            lineCount,
                                            {},
                                            undefined,
                                        ),
                                        index,
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
            <input
                type="number"
                min={0.1}
                max={1}
                step={0.1}
                value={props.getter()}
                onInput={(e) => props.setter(Math.min(Math.max(Number(e.target.value), 0.1), 1))}
            />
        </PageProp>
    );
};

const DirInput = (props: {
    getter: () => ScanlineAnimationBreakpoints.Direction;
    setter: (value: ScanlineAnimationBreakpoints.Direction) => void;
}) => {
    return (
        <PageProp getLabel={() => "Direction"}>
            <select
                value={props.getter()}
                onChange={(e) => props.setter(e.target.value as ScanlineAnimationBreakpoints.Direction)}
            >
                <For each={ScanlineAnimationBreakpoints.DIRECTIONS}>{(dir) => <option value={dir}>{dir}</option>}</For>
            </select>
        </PageProp>
    );
};

const OrdererInput = (props: {
    getter: () => ScanlineAnimationBreakpoints.OrderingType;
    setter: (value: ScanlineAnimationBreakpoints.OrderingType) => void;
}) => {
    return (
        <PageProp getLabel={() => "Ordering"}>
            <select
                value={props.getter()}
                onChange={(e) => props.setter(e.target.value as ScanlineAnimationBreakpoints.OrderingType)}
            >
                <For each={ScanlineAnimationBreakpoints.ORDER_TYPES}>
                    {(order) => <option value={order}>{order}</option>}
                </For>
            </select>
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
                    <input
                        type="number"
                        min={5}
                        max={25}
                        step={5}
                        value={keyframeOpts.shiftPercent}
                        onInput={(e) =>
                            setKeyframeOpts("shiftPercent", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 5), 25),
                            )
                        }
                    />
                </PageProp>

                <PageProp getLabel={() => "Chunkyness (0-1)"}>
                    <input
                        type="number"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={keyframeOpts.chunkyness}
                        onInput={(e) =>
                            setKeyframeOpts("chunkyness", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 0.1), 1),
                            )
                        }
                    />
                </PageProp>
            </PagePropsPanel>
        </>
    );
};

const SurgeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalStretchOpts>({
        peakScalePercent: 150,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
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
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Peak Scale (%)"}>
                    <input
                        type="number"
                        min={120}
                        max={200}
                        step={10}
                        value={keyframeOpts.peakScalePercent}
                        onInput={(e) =>
                            setKeyframeOpts("peakScalePercent", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 120), 200),
                            )
                        }
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </PagePropsPanel>
        </>
    );
};

const SnakeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalSnakeOpts>({
        shiftPercent: 5,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
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
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Shift (%)"}>
                    <input
                        type="number"
                        min={5}
                        max={25}
                        step={5}
                        value={keyframeOpts.shiftPercent}
                        onInput={(e) =>
                            setKeyframeOpts("shiftPercent", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 5), 25),
                            )
                        }
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </PagePropsPanel>
        </>
    );
};

const SplitExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalSplitOpts>({
        shiftPercent: 10,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
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
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <PageProp getLabel={() => "Shift (%)"}>
                    <input
                        type="number"
                        min={5}
                        max={25}
                        step={5}
                        value={keyframeOpts.shiftPercent}
                        onInput={(e) =>
                            setKeyframeOpts("shiftPercent", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 5), 25),
                            )
                        }
                    />
                </PageProp>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </PagePropsPanel>
        </>
    );
};

const BrightnessExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalBrightnessOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
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
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </PagePropsPanel>
        </>
    );
};

const GrayscaleExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalGrayscaleOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
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
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </PagePropsPanel>
        </>
    );
};

const HueExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts] = createStore<ScanlineAnimationKeyframesConst.HorizontalHueOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <PageMeasureBox getWidth={() => IMAGE_CONTAINER_SIZE}>
                <HueExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </PageMeasureBox>

            <PagePropsPanel getScope={() => "local"}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
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

    const handleFile = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        controllers = [];

        const commonProps: ScanlineAnimationExampleProps = {
            onMount: (controller) => {
                controllers.push(controller);
            },
            getSrc,
            getLineCount,
            getAnimationDurationMs,
            getAnimationIterationDelayMs,
            getOrder: () => "linear",
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
                    <input type="file" accept="image/*" onChange={handleFile} />
                </PageProp>

                <PageProp getLabel={() => "Line count"}>
                    <input
                        type="number"
                        min={8}
                        max={240}
                        step={4}
                        value={getLineCount()}
                        onInput={(e) =>
                            setLineCount((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 8), 240))
                        }
                    />
                </PageProp>

                <PageProp getLabel={() => "Animation duration (ms)"}>
                    <input
                        type="number"
                        min={100}
                        max={5000}
                        step={100}
                        value={getAnimationDurationMs()}
                        onInput={(e) =>
                            setAnimationDurationMs((prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 100), 5000),
                            )
                        }
                    />
                </PageProp>

                <PageProp getLabel={() => "Iteration delay (ms)"}>
                    <input
                        type="number"
                        min={0}
                        max={5000}
                        step={100}
                        value={getAnimationIterationDelayMs()}
                        onInput={(e) =>
                            setAnimationIterationDelayMs((prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 0), 5000),
                            )
                        }
                    />
                </PageProp>
            </PagePropsPanel>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
