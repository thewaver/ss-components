import { For, Show, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { ScanlineAnimationUtils } from "../../../../Lib/Fundamentals/ScanlineAnimation/ScanlineAnimation.utils";
import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { GlitchExample } from "./Examples/Glitch";
import GlitchExampleRaw from "./Examples/Glitch.tsx?raw";
import { SurgeExample } from "./Examples/Surge";
import SurgeExampleRaw from "./Examples/Surge.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./ScanlineAnimationPage.css";

const LINE_COUNT = 48;
const ANIM_DURATION = 2000;
const TAB_NAMES = ["Render", "Source"];
const GLITCH_SOURCE = highlighter.codeToHtml(GlitchExampleRaw, getDefaultHighlighterConfig());
const SURGE_SOURCE = highlighter.codeToHtml(SurgeExampleRaw, getDefaultHighlighterConfig());

export const GlitchExampleWrapper = () => {
    const [getLineCount, setLineCount] = createSignal(LINE_COUNT);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(ANIM_DURATION);
    const [getMaxShift, setMaxShift] = createSignal(10);

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <GlitchExample
                    getLineCount={getLineCount}
                    getAnimationDurationMs={getAnimationDurationMs}
                    getMaxShift={getMaxShift}
                />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Line count"}</div>
                    <input
                        type="number"
                        min={12}
                        max={96}
                        step={4}
                        value={getLineCount()}
                        onInput={(e) =>
                            setLineCount((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 12), 96))
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
                    <div>{"Max shift (%)"}</div>
                    <input
                        type="number"
                        min={5}
                        max={25}
                        step={5}
                        value={getMaxShift()}
                        onInput={(e) =>
                            setMaxShift((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 5), 25))
                        }
                    />
                </div>
            </div>
        </>
    );
};

export const SurgeExampleWrapper = () => {
    const [getLineCount, setLineCount] = createSignal(LINE_COUNT);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(ANIM_DURATION);
    const [opts, setOpts] = createStore<ScanlineAnimationUtils.HorizontalPulseOpts>({
        dir: "top",
        peakScalePercent: 150,
        smoothness: 0.1,
    });

    return (
        <>
            <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                <SurgeExample
                    getLineCount={getLineCount}
                    getAnimationDurationMs={getAnimationDurationMs}
                    getOpts={() => opts}
                />
            </div>

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Line count"}</div>
                    <input
                        type="number"
                        min={12}
                        max={96}
                        step={4}
                        value={getLineCount()}
                        onInput={(e) =>
                            setLineCount((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 12), 96))
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
                    <div>{"Peak Scale (%)"}</div>
                    <input
                        type="number"
                        min={120}
                        max={200}
                        step={10}
                        value={opts.peakScalePercent}
                        onInput={(e) =>
                            setOpts("peakScalePercent", (prev) =>
                                Math.min(Math.max(Number(e.target.value) ?? prev, 120), 200),
                            )
                        }
                    />
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Smoothness (0-1)"}</div>
                    <input
                        type="number"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={opts.smoothness}
                        onInput={(e) =>
                            setOpts("smoothness", (prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0.1), 1))
                        }
                    />
                </div>
            </div>
        </>
    );
};

export const ScanlineAnimationPage = () => {
    const getExamples = createMemo(() => [
        { name: "Glitch", component: () => <GlitchExampleWrapper />, src: GLITCH_SOURCE },
        { name: "Surge", component: () => <SurgeExampleWrapper />, src: SURGE_SOURCE },
    ]);

    const [getTabIndex, setTabIndex] = createSignal(getExamples().map(() => 0));

    return (
        <div class={styles.root}>
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
