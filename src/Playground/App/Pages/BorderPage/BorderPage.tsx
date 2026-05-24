import { For, createMemo, createSignal } from "solid-js";

import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { BORDER_CONFIGS } from "./BorderPage.config";
import type { BorderExampleProps } from "./BorderPage.types";
import { AsymmetricalExample } from "./Examples/Asymmetrical";
import AsymmetricalExampleRaw from "./Examples/Asymmetrical.tsx?raw";
import { SymmetricalExample } from "./Examples/Symmetrical";
import SymmetricalExampleRaw from "./Examples/Symmetrical.tsx?raw";

import * as pageStyles from "../Pages.css";
import * as styles from "./BorderPage.css";

const ASYMMETRICAL_SOURCE = highlighter.codeToHtml(AsymmetricalExampleRaw, getDefaultHighlighterConfig());
const SYMMETRICAL_SOURCE = highlighter.codeToHtml(SymmetricalExampleRaw, getDefaultHighlighterConfig());

export const AsymmetricalWrapper = (props: BorderExampleProps) => {
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

export const SymmetricalWrapper = (props: BorderExampleProps) => {
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

export const BorderPage = () => {
    const [getIsSolid, setIsSolid] = createSignal(false);
    const [getConfigKey, setConfigKey] = createSignal<keyof typeof BORDER_CONFIGS>("counterOrbit");

    const getExamples = createMemo(() => {
        const commonProps: BorderExampleProps = {
            getIsSolid,
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
        ];
    });

    return (
        <div class={styles.root}>
            <div class={[styles.container, pageStyles.exampleContainer].join(" ")}>
                <div class={pageStyles.props}>
                    <div class={pageStyles.propPanel}>
                        <div>{"Solid"}</div>
                        <input type="checkbox" checked={getIsSolid()} onChange={(e) => setIsSolid((prev) => !prev)} />
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Direction"}</div>
                        <select
                            value={getConfigKey()}
                            onChange={(e) => setConfigKey(e.target.value as keyof typeof BORDER_CONFIGS)}
                        >
                            <For each={Object.keys(BORDER_CONFIGS)}>
                                {(order) => <option value={order}>{order}</option>}
                            </For>
                        </select>
                    </div>
                </div>
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
