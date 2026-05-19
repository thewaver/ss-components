import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import {
    ScanlineAnimationBreakpoints,
    ScanlineAnimationKeyframes,
} from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import knight from "../../knight.png";
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

import * as pageStyles from "../Pages.css";
import * as styles from "./ScanlineAnimationPage.css";

const TAB_NAMES = ["Render", "Source"];
const GLITCH_SOURCE = highlighter.codeToHtml(GlitchExampleRaw, getDefaultHighlighterConfig());
const SURGE_SOURCE = highlighter.codeToHtml(SurgeExampleRaw, getDefaultHighlighterConfig());
const SNAKE_SOURCE = highlighter.codeToHtml(SnakeExampleRaw, getDefaultHighlighterConfig());
const SPLIT_SOURCE = highlighter.codeToHtml(SplitExampleRaw, getDefaultHighlighterConfig());
const GRAYSCALE_SOURCE = highlighter.codeToHtml(GrayscaleExampleRaw, getDefaultHighlighterConfig());
const HUE_SOURCE = highlighter.codeToHtml(HueExampleRaw, getDefaultHighlighterConfig());

const SmoothnessInput = (props: { getter: () => number; setter: (value: number) => void }) => {
    return (
        <div class={pageStyles.propPanel}>
            <div>{"Smoothness (0-1)"}</div>
            <input
                type="number"
                min={0.1}
                max={1}
                step={0.1}
                value={props.getter()}
                onInput={(e) => props.setter(Math.min(Math.max(Number(e.target.value), 0.1), 1))}
            />
        </div>
    );
};

const DirInput = (props: {
    getter: () => ScanlineAnimationBreakpoints.Direction;
    setter: (value: ScanlineAnimationBreakpoints.Direction) => void;
}) => {
    return (
        <div class={pageStyles.propPanel}>
            <div>{"Direction"}</div>
            <select
                value={props.getter()}
                onChange={(e) => props.setter(e.target.value as ScanlineAnimationBreakpoints.Direction)}
            >
                <For each={ScanlineAnimationBreakpoints.DIRECTIONS}>
                    {(order) => <option value={order}>{order}</option>}
                </For>
            </select>
        </div>
    );
};

const OrdererInput = (props: {
    getter: () => ScanlineAnimationBreakpoints.OrderingType;
    setter: (value: ScanlineAnimationBreakpoints.OrderingType) => void;
}) => {
    return (
        <div class={pageStyles.propPanel}>
            <div>{"Ordering"}</div>
            <select
                value={props.getter()}
                onChange={(e) => props.setter(e.target.value as ScanlineAnimationBreakpoints.OrderingType)}
            >
                <For each={ScanlineAnimationBreakpoints.ORDER_TYPES}>
                    {(order) => <option value={order}>{order}</option>}
                </For>
            </select>
        </div>
    );
};

const GlitchExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalShiftOpts>({
        maxShift: 10,
        chunkyness: 0.8,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <GlitchExample {...props} getKeyframeOpts={() => keyframeOpts} />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Max shift (%)"}</div>
                    <input
                        type="number"
                        min={5}
                        max={25}
                        step={5}
                        value={keyframeOpts.maxShift}
                        onInput={(e) =>
                            setKeyframeOpts("maxShift", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 5), 25),
                            )
                        }
                    />
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Chunkyness (0-1)"}</div>
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
                </div>
            </div>
        </>
    );
};

const SurgeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalStretchOpts>({
        peakScalePercent: 150,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.2,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <SurgeExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Peak Scale (%)"}</div>
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
                </div>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </div>
        </>
    );
};

const SnakeExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalSnakeOpts>({
        shiftPercent: 5,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.2,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <SnakeExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Shift (%)"}</div>
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
                </div>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </div>
        </>
    );
};

const SplitExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalSplitOpts>({
        shiftPercent: 10,
    });
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 1,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <SplitExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Shift (%)"}</div>
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
                </div>

                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </div>
        </>
    );
};

const GrayscaleExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalGrayscaleOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <GrayscaleExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </div>

            <div class={pageStyles.props}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </div>
        </>
    );
};

const HueExampleWrapper = (props: ScanlineAnimationExampleProps) => {
    const [getOrder, setOrder] = createSignal(props.getOrder());
    const [keyframeOpts, setKeyframeOpts] = createStore<ScanlineAnimationKeyframes.HorizontalHueOpts>({});
    const [breakpointOpts, setBreakpointOpts] = createStore<ScanlineAnimationBreakpoints.BreakpointOpts>({
        dir: "asc",
        smoothness: 0.5,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <HueExample
                    {...props}
                    getKeyframeOpts={() => keyframeOpts}
                    getBreakpointOpts={() => breakpointOpts}
                    getOrder={getOrder}
                />
            </div>

            <div class={pageStyles.props}>
                <SmoothnessInput
                    getter={() => breakpointOpts.smoothness!}
                    setter={(value) => setBreakpointOpts("smoothness", value)}
                />
                <DirInput getter={() => breakpointOpts.dir!} setter={(value) => setBreakpointOpts("dir", value)} />
                <OrdererInput getter={getOrder} setter={setOrder} />
            </div>
        </>
    );
};

export const ScanlineAnimationPage = () => {
    const [getSrc, setSrc] = createSignal(knight);
    const [getLineCount, setLineCount] = createSignal(160);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getAnimationIterationDelayMs, setAnimationIterationDelayMs] = createSignal(1000);

    const handleFile = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];

        if (!file) return;

        setSrc(URL.createObjectURL(file));
    };

    const getExamples = createMemo(() => {
        const commonProps: ScanlineAnimationExampleProps = {
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
                name: "Grayscale",
                component: () => <GrayscaleExampleWrapper {...commonProps} />,
                src: GRAYSCALE_SOURCE,
            },
            {
                name: "Hue",
                component: () => <HueExampleWrapper {...commonProps} />,
                src: HUE_SOURCE,
            },
        ];
    });

    const [getTabIndex, setTabIndex] = createSignal(getExamples().map(() => 0));

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                <div class={pageStyles.propPanel}>
                    <div>{"Image"}</div>
                    <input type="file" accept="image/*" onChange={handleFile} />
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Line count"}</div>
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
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Animation duration (ms)"}</div>
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
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Iteration delay (ms)"}</div>
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
                </div>
            </div>

            <div class={pageStyles.examplesContainer}>
                <For each={getExamples()}>
                    {(example, getExampleIndex) => (
                        <div class={[styles.container, pageStyles.container].join(" ")}>
                            {`${example.name}:`}

                            <Tabs
                                getDir={() => "row"}
                                getTabGap={() => 10}
                                getSelectedIndex={() => getTabIndex()[getExampleIndex()]}
                                getTabCount={() => 2}
                                onSelectionChange={(value) =>
                                    setTabIndex((prev) => {
                                        const next = [...prev];

                                        next[getExampleIndex()] = value;

                                        return next;
                                    })
                                }
                                renderGutter={() => <div class={pageStyles.tabsGutter} />}
                                renderFloater={() => <div class={pageStyles.tabFloater} />}
                                renderTab={(getIndex) => (
                                    <div
                                        class={pageStyles.tabItem}
                                        classList={{
                                            [pageStyles.isSelected]: getIndex() === getTabIndex()[getExampleIndex()],
                                        }}
                                    >
                                        {TAB_NAMES[getIndex()]}
                                    </div>
                                )}
                            />

                            <Show when={getTabIndex()[getExampleIndex()] === 0}>{example.component()}</Show>
                            <Show when={getTabIndex()[getExampleIndex()] === 1}>
                                <div class={pageStyles.codeBoxOutter}>
                                    <div class={pageStyles.codeBoxInner} innerHTML={example.src} />
                                </div>
                            </Show>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};
