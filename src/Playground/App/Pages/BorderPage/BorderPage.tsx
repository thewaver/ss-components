import { Show, createSignal } from "solid-js";

import { Tabs } from "../../../../Lib/Fundamentals/Tabs/Tabs";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { AsymetricExample } from "./Examples/Asymetric";
import AsymetricExampleRaw from "./Examples/Asymetric.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./BorderPage.css";

const TAB_NAMES = ["Render", "Source"];
const ASYMETRIC_SOURCE = highlighter.codeToHtml(AsymetricExampleRaw, getDefaultHighlighterConfig());

export const BorderPage = () => {
    const [getTabIndex, setTabIndex] = createSignal(0);
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.container].join(" ")}>
                {"Asymetric:"}

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
                    <AsymetricExample getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

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
                </Show>
                <Show when={getTabIndex() === 1}>
                    <div class={pageStyles.codeBoxOutter}>
                        <div class={pageStyles.codeBoxInner} innerHTML={ASYMETRIC_SOURCE} />
                    </div>
                </Show>
            </div>
        </div>
    );
};
