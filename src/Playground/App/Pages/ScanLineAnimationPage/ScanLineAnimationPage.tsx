import { Show, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { highlighter, highlighterTheme } from "../../../shiki";
import { GlitchExample } from "./Examples/Glitch";
import GlitchExampleRaw from "./Examples/Glitch.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./ScanlineAnimationPage.css";

const GLITCH_TAB_NAMES = ["Render", "Source"];
const GLITCH_SOURCE = highlighter.codeToHtml(GlitchExampleRaw, {
    lang: "tsx",
    theme: highlighterTheme,
    transformers: [
        {
            pre(node) {
                delete node.properties.style; // removes background-color
            },
        },
    ],
});

export const ScanlineAnimationPage = () => {
    const [getTabIndex, setTabIndex] = createSignal(0);

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                {"Glitch:"}

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
                            {GLITCH_TAB_NAMES[getIndex()]}
                        </div>
                    )}
                />

                <Show when={getTabIndex() === 0}>
                    <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                        <GlitchExample />
                    </div>
                </Show>
                <Show when={getTabIndex() === 1}>
                    <div class={pageStyles.codeBoxOutter}>
                        <div class={pageStyles.codeBoxInner} innerHTML={GLITCH_SOURCE} />
                    </div>
                </Show>
            </div>
        </div>
    );
};
