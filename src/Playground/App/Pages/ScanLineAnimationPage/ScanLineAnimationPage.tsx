import { For, Show, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { GlitchExample } from "./Examples/Glitch";
import GlitchExampleRaw from "./Examples/Glitch.tsx?raw";
import { SurgeExample } from "./Examples/Surge";
import SurgeExampleRaw from "./Examples/Surge.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./ScanlineAnimationPage.css";

const TAB_NAMES = ["Render", "Source"];
const GLITCH_SOURCE = highlighter.codeToHtml(GlitchExampleRaw, getDefaultHighlighterConfig());
const SURGE_SOURCE = highlighter.codeToHtml(SurgeExampleRaw, getDefaultHighlighterConfig());

const EXAMPLES = [
    { name: "Glitch", component: () => <GlitchExample />, src: GLITCH_SOURCE },
    { name: "Surge", component: () => <SurgeExample />, src: SURGE_SOURCE },
];

export const ScanlineAnimationPage = () => {
    const [getTabIndex, setTabIndex] = createSignal(EXAMPLES.map(() => 0));

    return (
        <div class={styles.root}>
            <div class={pageStyles.examplesContainer}>
                <For each={EXAMPLES}>
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

                            <Show when={getTabIndex()[getExampleIndex()] === 0}>
                                <div class={[styles.imageContainer, pageStyles.measureBox].join(" ")}>
                                    {example.component()}
                                </div>
                            </Show>
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
