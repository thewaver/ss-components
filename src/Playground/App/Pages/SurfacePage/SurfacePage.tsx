import { For, createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { assignInlineVars } from "@vanilla-extract/dynamic";

import { CSSUtils } from "../../../../Lib/Abstracts/CSS/CSS.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { Surface } from "../../../../Lib/Fundamentals/Surface/Surface";
import { getDefaultHighlighterConfig, highlighter } from "../../../shiki";
import { PageExamples } from "../../PageComponents/Examples/Examples";
import { AsymmetricalExample } from "./Examples/Asymmetrical";
import AsymmetricalExampleRaw from "./Examples/Asymmetrical.tsx?raw";
import { WideExample } from "./Examples/Wide";
import WideExampleRaw from "./Examples/Wide.tsx?raw";
import { SURFACE_CONFIGS } from "./SurfacePage.config";
import type { SurfaceConfigColors, SurfaceExampleProps } from "./SurfacePage.types";

import * as pageStyles from "../Pages.css";
import * as styles from "./SurfacePage.css";

const STRESS_ITEMS = Array.from({ length: 200 }, (_, idx) => idx + 1);
const STARTING_COLORS: SurfaceConfigColors = {
    background: "#282018",
    primary: "#FFFF00",
    secondary: "#00FFFF",
    tertiary: "#FF00FF",
};
const ASYMMETRICAL_SOURCE = highlighter.codeToHtml(AsymmetricalExampleRaw, getDefaultHighlighterConfig());
const WIDE_SOURCE = highlighter.codeToHtml(WideExampleRaw, getDefaultHighlighterConfig());

const AsymmetricalWrapper = (props: SurfaceExampleProps) => {
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
                        max={40}
                        step={1}
                        value={getBorderWidth()}
                        onInput={(e) =>
                            setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 40))
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

const WideWrapper = (props: SurfaceExampleProps) => {
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
                        max={40}
                        step={1}
                        value={getBorderWidth()}
                        onInput={(e) =>
                            setBorderWidth((prev) => Math.min(Math.max(Number(e.target.value) ?? prev, 0), 40))
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

export const SurfacePage = () => {
    const [getModalOpen, setModalOpen] = createSignal(false);
    const [getShouldPadChildren, setShouldPadChildren] = createSignal(false);
    const [getShouldApplyBlur, setShouldApplyBlur] = createSignal(true);
    const [getAnimationDurationMs, setAnimationDurationMs] = createSignal(2000);
    const [getStrokeConfigKey, setStrokeConfigKey] = createSignal<keyof typeof SURFACE_CONFIGS>("sweepDiagonal_1");
    const [getFillConfigKey, setFillConfigKey] = createSignal<keyof typeof SURFACE_CONFIGS>("plain");
    const [colors, setColors] = createStore(STARTING_COLORS);

    const getExamples = createMemo(() => {
        const commonProps: SurfaceExampleProps = {
            getShouldPadChildren,
            getShouldApplyBlur,
            getAnimationDurationMs,
            getColors: () => colors,
            getStrokeConfig: () => SURFACE_CONFIGS[getStrokeConfigKey()],
            getFillConfig: () => SURFACE_CONFIGS[getFillConfigKey()],
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
            <Button
                onClick={async () => {
                    setModalOpen(true);
                }}
            >
                <div class={pageStyles.buttonContent}>{`Render ${STRESS_ITEMS.length} isntances`}</div>
            </Button>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                getIsVisible={getModalOpen}
                onHide={() => {
                    setModalOpen(false);
                }}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <div
                        class={getVisibilityTarget() === 1 ? pageStyles.overlayOn : pageStyles.overlayOff}
                        style={{
                            transition: `background-color ${getTransitionDurationMs()}ms, backdrop-filter ${getTransitionDurationMs()}ms`,
                        }}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <div
                        class={[
                            getVisibilityTarget() === 1 ? pageStyles.modalOn : pageStyles.modalOff,
                            pageStyles.exampleContainer,
                        ].join(" ")}
                        style={{
                            transition: `transform ${getTransitionDurationMs()}ms`,
                        }}
                    >
                        <div class={styles.stressContainer}>
                            <For each={STRESS_ITEMS}>
                                {(item) => (
                                    <Surface
                                        getBorderRadii={() => CSSUtils.spreadRadius(10)}
                                        getBorderWidths={() => CSSUtils.spreadWidth(4)}
                                        getPaddings={() => CSSUtils.spreadPadding(20)}
                                        getStrokeDefs={(getSize, getBorderWidths, getBorderRadii, getState) =>
                                            SURFACE_CONFIGS[getStrokeConfigKey()].getColorDefs(
                                                "stress-stroke",
                                                getState,
                                                {
                                                    getSize,
                                                    getBorderWidths,
                                                    getBorderRadii,
                                                    getAnimationDurationMs,
                                                    getColors: () => colors,
                                                    getShouldApplyBlur,
                                                },
                                            )
                                        }
                                        getFillDefs={(getSize, getBorderRadii, getState) =>
                                            SURFACE_CONFIGS[getFillConfigKey()].getColorDefs("stress-fill", getState, {
                                                getSize,
                                                getBorderRadii,
                                                getAnimationDurationMs,
                                                getColors: () => colors,
                                                getShouldApplyBlur,
                                            })
                                        }
                                        renderChildren={(outer, inner) => (
                                            <div
                                                class={[
                                                    styles.borderedContentSmall,
                                                    getShouldPadChildren?.() ? inner : outer,
                                                ].join(" ")}
                                            >
                                                {item}
                                            </div>
                                        )}
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                )}
            />

            <div class={[styles.container, pageStyles.exampleContainer].join(" ")}>
                <div class={pageStyles.props}>
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
                        <div>{"Stroke Pattern"}</div>
                        <select
                            value={getStrokeConfigKey()}
                            onChange={(e) => setStrokeConfigKey(e.target.value as keyof typeof SURFACE_CONFIGS)}
                        >
                            <For each={Object.keys(SURFACE_CONFIGS)}>
                                {(config) => <option value={config}>{config}</option>}
                            </For>
                        </select>
                    </div>

                    <div class={pageStyles.propPanel}>
                        <div>{"Fill Pattern"}</div>
                        <select
                            value={getFillConfigKey()}
                            onChange={(e) => setFillConfigKey(e.target.value as keyof typeof SURFACE_CONFIGS)}
                        >
                            <For each={Object.keys(SURFACE_CONFIGS)}>
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
