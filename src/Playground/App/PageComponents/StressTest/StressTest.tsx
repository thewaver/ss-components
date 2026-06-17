import { For, createMemo, createSignal } from "solid-js";

import { CSSUtils } from "../../../../Lib/Abstracts/CSS/CSS.utils";
import { FPSUtils } from "../../../../Lib/Abstracts/FPS/FPS.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import type { StressTestProps } from "./StressText.types";

import * as pageStyles from "./../../Pages/Pages.css";
import * as styles from "./StressTest.css";

export const StressTest = (props: StressTestProps) => {
    const [getModalOpen, setModalOpen] = createSignal(false);
    const [getConfigIndex, setConfigIndex] = createSignal(0);

    const getArr = createMemo(() =>
        Array.from({ length: props.getConfigs()[getConfigIndex()].count }, (_, idx) => idx),
    );

    const { getFPS } = FPSUtils.createMonitor(getModalOpen);

    return (
        <>
            <div class={pageStyles.localPropsContainer}>
                <For each={props.getConfigs()}>
                    {(items, getIndex) => (
                        <Button
                            getSizing={() => "fill"}
                            onClick={async () => {
                                setConfigIndex(getIndex());
                                setModalOpen(true);
                            }}
                        >
                            <div
                                class={pageStyles.buttonContent}
                                style={{ filter: `hue-rotate(${items.anchorHue}deg)` }}
                            >
                                {props.renderLabel(getIndex)}
                            </div>
                        </Button>
                    )}
                </For>
            </div>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                getIsVisible={getModalOpen}
                onShow={props.onShowModal}
                onHide={() => {
                    setModalOpen(false);
                    props.onHideModal?.();
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
                            position: "relative",
                        }}
                    >
                        <div
                            class={styles.fpsCounter}
                        >{`FPS: ${getFPS().current.toFixed(1)}\nAVG: ${getFPS().average.toFixed(1)}`}</div>
                        <div
                            class={pageStyles.stressContainer}
                            style={{
                                "grid-template-columns": `repeat(${props.getConfigs()[getConfigIndex()].cols}, auto)`,
                                "gap": `${props.getConfigs()[getConfigIndex()].gap}px`,
                            }}
                        >
                            <For each={getArr()}>{(_, getIndex) => props.renderItem(getConfigIndex, getIndex)}</For>
                        </div>
                    </div>
                )}
            />
        </>
    );
};
