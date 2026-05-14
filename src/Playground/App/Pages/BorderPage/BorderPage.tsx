import { For, Show, createMemo, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { AsymmetricalExample } from "./Examples/Asymmetrical";
import AsymmetricalExampleRaw from "./Examples/Asymmetrical.tsx?raw";
import { SymmetricalExample } from "./Examples/Symmetrical";
import SymmetricalExampleRaw from "./Examples/Symmetrical.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./BorderPage.css";

const TAB_NAMES = ["Render", "Source"];
const ASYMMETRICAL_SOURCE = highlighter.codeToHtml(AsymmetricalExampleRaw, getDefaultHighlighterConfig());
const SYMMETRICAL_SOURCE = highlighter.codeToHtml(SymmetricalExampleRaw, getDefaultHighlighterConfig());

export const AsymmetricalWrapper = () => {
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <>
            <AsymmetricalExample getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Border width (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={20}
                        step={1}
                        value={getBorderWidth()}
                        onInput={(e) =>
                            setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 20))
                        }
                    />
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Border radius (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={80}
                        step={5}
                        value={getBorderRadius()}
                        onInput={(e) =>
                            setBorderRadius((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80))
                        }
                    />
                </div>
            </div>
        </>
    );
};

export const SymmetricalWrapper = () => {
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <>
            <SymmetricalExample getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

            <div class={pageStyles.props}>
                <div class={pageStyles.propPanel}>
                    <div>{"Border width (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={20}
                        step={1}
                        value={getBorderWidth()}
                        onInput={(e) =>
                            setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 20))
                        }
                    />
                </div>

                <div class={pageStyles.propPanel}>
                    <div>{"Border radius (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={80}
                        step={5}
                        value={getBorderRadius()}
                        onInput={(e) =>
                            setBorderRadius((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80))
                        }
                    />
                </div>
            </div>
        </>
    );
};

export const BorderPage = () => {
    const getExamples = createMemo(() => {
        return [
            {
                name: "Symmetrical",
                component: () => <SymmetricalWrapper />,
                src: SYMMETRICAL_SOURCE,
            },
            {
                name: "Asymmetrical",
                component: () => <AsymmetricalWrapper />,
                src: ASYMMETRICAL_SOURCE,
            },
        ];
    });

    const [getTabIndex, setTabIndex] = createSignal(getExamples().map(() => 0));

    return (
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
    );
};
