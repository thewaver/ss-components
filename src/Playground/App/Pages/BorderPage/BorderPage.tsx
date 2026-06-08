import { For, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { BORDER_CONFIGS } from "./BorderPage.config";
import type { BorderConfigColors, BorderExampleProps } from "./BorderPage.types";
import { AsymmetricalExample } from "./Examples/Asymmetrical";
import AsymmetricalExampleRaw from "./Examples/Asymmetrical.tsx?raw";
import { SymmetricalExample } from "./Examples/Symmetrical";
import SymmetricalExampleRaw from "./Examples/Symmetrical.tsx?raw";
import { WideExample } from "./Examples/Wide";
import WideExampleRaw from "./Examples/Wide.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./BorderPage.css";

const STARTING_COLORS: BorderConfigColors = {
    background: "#282018",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const ASYMMETRICAL_SOURCE = highlighter.codeToHtml(AsymmetricalExampleRaw, getDefaultHighlighterConfig());
const SYMMETRICAL_SOURCE = highlighter.codeToHtml(SymmetricalExampleRaw, getDefaultHighlighterConfig());
const WIDE_SOURCE = highlighter.codeToHtml(WideExampleRaw, getDefaultHighlighterConfig());

const AsymmetricalWrapper = (props: BorderExampleProps) => {
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <>
            <AsymmetricalExample {...props} getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

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

const SymmetricalWrapper = (props: BorderExampleProps) => {
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <>
            <SymmetricalExample {...props} getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

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

const WideWrapper = (props: BorderExampleProps) => {
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);

    return (
        <>
            <WideExample {...props} getBorderRadius={getBorderRadius} getBorderWidth={getBorderWidth} />

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
    const [getIsSolid, setIsSolid] = createSignal(false);
    const [getShouldPadChildren, setShouldPadChildren] = createSignal(false);
    const [getShouldApplyBlur, setShouldApplyBlur] = createSignal(true);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getConfigKey, setConfigKey] = createSignal<keyof typeof BORDER_CONFIGS>("sweepDiagonal_1");
    const [colors, setColors] = createStore(STARTING_COLORS);

    const getExamples = createMemo(() => {
        const commonProps: BorderExampleProps = {
            getIsSolid,
            getShouldPadChildren,
            getShouldApplyBlur,
            getAnimationDurationMs,
            getColors: () => colors,
            getConfig: () => BORDER_CONFIGS[getConfigKey()],
        };

        return [
            {
                name: "Symmetrical",
                component: () => <SymmetricalWrapper {...commonProps} />,
                src: SYMMETRICAL_SOURCE,
            },
            {
                name: "Asymmetrical",
                component: () => <AsymmetricalWrapper {...commonProps} />,
                src: ASYMMETRICAL_SOURCE,
            },
            {
                name: "Wide",
                component: () => <WideWrapper {...commonProps} />,
                src: WIDE_SOURCE,
            },
        ];
    });

    return (
        <div class={styles.root} style={assignInlineVars({ [styles.backgroundColor]: colors.background })}>
            <div class={[styles.container, pageStyles.exampleContainer].join(" ")}>
                <div class={pageStyles.props}>
                    <div class={pageStyles.propPanel}>
                        <div>{"Solid"}</div>
                        <input type="checkbox" checked={getIsSolid()} onChange={(e) => setIsSolid((prev) => !prev)} />
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Pad children"}</div>
                        <input
                            type="checkbox"
                            checked={getShouldPadChildren()}
                            onChange={(e) => setShouldPadChildren((prev) => !prev)}
                        />
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Animation duration (ms)"}</div>
                        <input
                            type="number"
                            min={1000}
                            max={5000}
                            step={100}
                            value={getAnimationDurationMs()}
                            onInput={(e) =>
                                setAnimationDurationMs((prev) =>
                                    Math.min(Math.max(Number(e.target.value) ?? prev, 1000), 5000),
                                )
                            }
                        />
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Direction"}</div>
                        <select
                            value={getConfigKey()}
                            onChange={(e) => setConfigKey(e.target.value as keyof typeof BORDER_CONFIGS)}
                        >
                            <For each={Object.keys(BORDER_CONFIGS)}>
                                {(config) => <option value={config}>{config}</option>}
                            </For>
                        </select>
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Colors"}</div>
                        <div class={styles.colorList}>
                            <For each={Object.entries(colors)}>
                                {([key, value]) => (
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => setColors(key as keyof typeof colors, e.target.value)}
                                    />
                                )}
                            </For>
                        </div>
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Shine on your crazy diamond™"}</div>
                        <input
                            type="checkbox"
                            checked={getShouldApplyBlur()}
                            onChange={(e) => setShouldApplyBlur((prev) => !prev)}
                        />
                    </div>
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
