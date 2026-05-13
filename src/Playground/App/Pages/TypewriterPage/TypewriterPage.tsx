import { Show, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { ComplexExample } from "./Examples/Complex";
import ComplexExampleRaw from "./Examples/Complex.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

const STARTING_WIDTH = 240;
const STARTING_TEXT = "I am a brown, crispy potatoe!?...";
const TAB_NAMES = ["Render", "Source"];
const COMPLEX_SOURCE = highlighter.codeToHtml(ComplexExampleRaw, getDefaultHighlighterConfig());

export const TypewriterPage = () => {
    const [getTabIndex, setTabIndex] = createSignal(0);
    const [getTextContainerWidth, setTextContainerWidth] = createSignal(STARTING_WIDTH);

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                {"Complex example:"}

                <Tabs
                    getDir={() => "row"}
                    getTabGap={() => 10}
                    getSelectedIndex={getTabIndex}
                    getTabCount={() => 2}
                    onSelectionChange={setTabIndex}
                    renderGutter={() => <div class={pageStyles.tabsGutter} />}
                    renderFloater={() => <div class={pageStyles.tabFloater} />}
                    renderTab={(getIndex) => (
                        <div
                            class={pageStyles.tabItem}
                            classList={{ [pageStyles.isSelected]: getIndex() === getTabIndex() }}
                        >
                            {TAB_NAMES[getIndex()]}
                        </div>
                    )}
                />

                <Show when={getTabIndex() === 0}>
                    <div
                        class={[styles.textContent, pageStyles.measureBox].join(" ")}
                        style={{ width: `${getTextContainerWidth()}px` }}
                    >
                        <ComplexExample />
                    </div>

                    <div class={pageStyles.props}>
                        <div class={pageStyles.propPanel}>
                            <div>{"Container width"}</div>
                            <input
                                type="number"
                                min={40}
                                max={560}
                                step={4}
                                value={getTextContainerWidth()}
                                onInput={(e) =>
                                    setTextContainerWidth((prev) =>
                                        Math.min(Math.max(Number(e.target.value) ?? prev, 40), 560),
                                    )
                                }
                            />
                        </div>
                    </div>
                </Show>
                <Show when={getTabIndex() === 1}>
                    <div class={pageStyles.codeBoxOutter}>
                        <div class={pageStyles.codeBoxInner} innerHTML={COMPLEX_SOURCE} />
                    </div>
                </Show>
            </div>
        </div>
    );
};
