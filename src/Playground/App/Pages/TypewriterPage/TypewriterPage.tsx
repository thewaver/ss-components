import { Show, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { Sizer } from "../../Components/Sizer/Sizer";
import { ComplexExample } from "./Examples/Complex";
import ComplexExampleRaw from "./Examples/Complex.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./TypewriterPage.css";

const STARTING_WIDTH = 240;
const STARTING_TEXT = "I am a brown, crispy potatoe!?...";
const COMPLEX_TAB_NAMES = ["Render", "Source"];
const COMPLEX_SOURCE = highlighter.codeToHtml(ComplexExampleRaw, getDefaultHighlighterConfig());

export const TypewriterPage = () => {
    const [getTabIndex, setTabIndex] = createSignal(0);
    const [getTextWidth, setTextWidth] = createSignal(STARTING_WIDTH);

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                {"Complex example:"}

                <Tabs
                    getDir={() => "row"}
                    getTabGap={() => 20}
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
                            {COMPLEX_TAB_NAMES[getIndex()]}
                        </div>
                    )}
                />

                <Show when={getTabIndex() === 0}>
                    <div
                        class={[styles.textContent, pageStyles.measureBox].join(" ")}
                        style={{ width: `${getTextWidth()}px` }}
                    >
                        <ComplexExample />
                    </div>

                    <Sizer
                        getValue={getTextWidth}
                        getMin={() => 40}
                        getMax={() => 560}
                        getStep={() => 4}
                        onChange={setTextWidth}
                    />
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
