import { For, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { SVGDefsSamples } from "../../../../Lib/Abstracts/SVG/Defs/SVGDefs.const";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AsymmetricalExample } from "./Examples/Asymmetrical";
import AsymmetricalExampleRaw from "./Examples/Asymmetrical.tsx?raw";
import { WideExample } from "./Examples/Wide";
import WideExampleRaw from "./Examples/Wide.tsx?raw";
import type { SurfaceExampleProps } from "./SurfacePage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./SurfacePage.css";

const STARTING_COLORS: SVGDefsSamples.ColorDefs = {
    background: "#282018",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const ASYMMETRICAL_SOURCE = highlighter.codeToHtml(AsymmetricalExampleRaw, getDefaultHighlighterConfig());
const WIDE_SOURCE = highlighter.codeToHtml(WideExampleRaw, getDefaultHighlighterConfig());

const AsymmetricalWrapper = (props: SurfaceExampleProps) => {
    return <AsymmetricalExample {...props} />;
};

const WideWrapper = (props: SurfaceExampleProps) => {
    return <WideExample {...props} />;
};

export const SurfacePage = () => {
    const [getShouldClipChildren, setShouldClipChildren] = createSignal(true);
    const [getBlurWidth, setBlurWidth] = createSignal(8);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getBorderWidth, setBorderWidth] = createSignal(4);
    const [getBorderRadius, setBorderRadius] = createSignal(20);
    const [getLameExponent, setLameExponent] = createSignal(1);
    const [getStrokeConfigKey, setStrokeConfigKey] =
        createSignal<keyof typeof SVGDefsSamples.SAMPLE_CONFIGS>("sweepDiagonal_1v1");
    const [colors, setColors] = createStore(STARTING_COLORS);

    const getExamples = createMemo(() => {
        const commonProps: SurfaceExampleProps = {
            getShouldClipChildren,
            getBorderWidth,
            getBorderRadius,
            getLameExponent,
            getBlurWidth,
            getAnimationDurationMs,
            getColors: () => colors,
            getStrokeConfig: () => SVGDefsSamples.SAMPLE_CONFIGS[getStrokeConfigKey()],
        };

        return [
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
            <div class={pageStyles.globalPropsContainer}>
                <div class={pageStyles.propContainer}>
                    <div>{"Clip children"}</div>
                    <input
                        type="checkbox"
                        checked={getShouldClipChildren()}
                        onChange={() => setShouldClipChildren((prev) => !prev)}
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Border Width (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={80}
                        step={1}
                        value={getBorderWidth()}
                        onInput={(e) =>
                            setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 80))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Border Radius (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={160}
                        step={5}
                        value={getBorderRadius()}
                        onInput={(e) =>
                            setBorderRadius((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 160))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Lamé Exponent"}</div>
                    <input
                        type="number"
                        min={-5}
                        max={5}
                        step={0.5}
                        value={getLameExponent()}
                        onInput={(e) =>
                            setLameExponent((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, -5), 5))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
                    <div>{"Stroke Pattern"}</div>
                    <select
                        value={getStrokeConfigKey()}
                        onChange={(e) =>
                            setStrokeConfigKey(e.target.value as keyof typeof SVGDefsSamples.SAMPLE_CONFIGS)
                        }
                    >
                        <For each={Object.keys(SVGDefsSamples.SAMPLE_CONFIGS)}>
                            {(config) => <option value={config}>{config}</option>}
                        </For>
                    </select>
                </div>

                <div class={pageStyles.propContainer}>
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

                <div class={pageStyles.propContainer}>
                    <div>{"Blur (px)"}</div>
                    <input
                        type="number"
                        min={0}
                        max={40}
                        step={1}
                        value={getBlurWidth()}
                        onInput={(e) =>
                            setBlurWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 40))
                        }
                    />
                </div>

                <div class={pageStyles.propContainer}>
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
            </div>

            <PageExamples getItems={getExamples} />
        </div>
    );
};
