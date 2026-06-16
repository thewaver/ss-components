import { For, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { CSSUtils } from "../../../../Lib/Abstracts/CSS/CSS.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import type { StressTestProps } from "./StressText.types";

import * as pageStyles from "./../../Pages/Pages.css";
import * as styles from "./StressTest.css";

const FPS_INTERVAL = 1000;

export const StressTest = (props: StressTestProps) => {
    const [getFPS, setFPS] = createSignal({ current: 0, average: 0 });
    const [getModalOpen, setModalOpen] = createSignal(false);
    const [getConfigIndex, setConfigIndex] = createSignal(0);

    const getArr = createMemo(() =>
        Array.from({ length: props.getConfigs()[getConfigIndex()].count }, (_, idx) => idx),
    );

    createEffect(() => {
        let cycleFrameCount = 0;
        let totalFrameCount = 0;
        let lastTime: number;
        let firstTime: number;
        let rafId: ReturnType<typeof requestAnimationFrame>;

        onCleanup(() => {
            cancelAnimationFrame(rafId);

            cycleFrameCount = 0;
            totalFrameCount = 0;
            lastTime = 0;
            firstTime = 0;
        });

        if (!getModalOpen()) return;

        const updateFPS = () => {
            const now = performance.now();

            cycleFrameCount++;
            totalFrameCount++;

            if (now - lastTime >= FPS_INTERVAL) {
                const current = (cycleFrameCount * FPS_INTERVAL) / (now - lastTime);
                const average = (totalFrameCount * FPS_INTERVAL) / (now - firstTime);

                cycleFrameCount = 0;
                lastTime = now;

                setFPS({ current, average });
            }

            rafId = requestAnimationFrame(updateFPS);
        };

        setTimeout(() => {
            lastTime = performance.now();
            firstTime = lastTime;

            rafId = requestAnimationFrame(updateFPS);
        }, FPS_INTERVAL);
    });

    return (
        <>
            <For each={props.getConfigs()}>
                {(items, getIndex) => (
                    <Button
                        onClick={async () => {
                            setConfigIndex(getIndex());
                            setModalOpen(true);
                        }}
                    >
                        <div
                            class={pageStyles.buttonContent}
                            style={{ filter: `hue-rotate(${items.anchorHue}deg)` }}
                        >{`Render ${items.count} isntances`}</div>
                    </Button>
                )}
            </For>

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
                        <div
                            class={pageStyles.stressContainer}
                            style={{
                                "grid-template-columns": `repeat(${props.getConfigs()[getConfigIndex()].cols}, auto)`,
                                "gap": `${props.getConfigs()[getConfigIndex()].gap}px`,
                            }}
                        >
                            <div
                                class={styles.fpsCounter}
                            >{`FPS: ${getFPS().current.toFixed(1)}\nAVG: ${getFPS().average.toFixed(1)}`}</div>
                            <For each={getArr()}>{(_, getIndex) => props.renderItem(getConfigIndex, getIndex)}</For>
                        </div>
                    </div>
                )}
            />
        </>
    );
};
