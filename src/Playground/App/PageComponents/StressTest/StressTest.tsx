import { For, createMemo, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { FPSUtils } from "../../../../Lib/Abstracts/FPS/FPS.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PagePropsPanel } from "../PropsPanel/PropsPanel";
import type { StressTestProps } from "./StressText.types";

import * as pageStyles from "./../../Pages/Pages.css";
import * as styles from "./StressTest.css";

export const StressTest = (props: StressTestProps) => {
    const modalVisibility = createSignal(false);
    const [getModalOpen, setModalOpen] = modalVisibility;
    const [getModalTransitionFinished, setModalTransitionFinished] = createSignal(false);
    const [getConfigIndex, setConfigIndex] = createSignal(0);

    const getArr = createMemo(() =>
        Array.from({ length: props.getConfigs()[getConfigIndex()].count }, (_, idx) => idx),
    );

    const getIsMonitoringDisabled = createMemo(() => {
        const isOpen = getModalOpen();
        const isStable = getModalTransitionFinished();

        return !(isOpen && isStable);
    });

    const { getFPS } = FPSUtils.createMonitor(getIsMonitoringDisabled);

    return (
        <>
            <PagePropsPanel getScope={() => "local"}>
                <For each={props.getConfigs()}>
                    {(items, getIndex) => (
                        <Button
                            getSizing={() => "fill"}
                            onClick={async () => {
                                setConfigIndex(getIndex());
                                setModalOpen(true);
                            }}
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>{props.renderLabel(getIndex)}</PageButtonContent>
                            )}
                        />
                    )}
                </For>
            </PagePropsPanel>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                visibilitySignal={modalVisibility}
                getAriaLabel={() => "Stress test"}
                onShow={props.onShowModal}
                onHide={props.onHideModal}
                onTransitionStatusChange={setModalTransitionFinished}
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
                            pageStyles.panel,
                        ].join(" ")}
                        style={{
                            transition: `transform ${getTransitionDurationMs()}ms`,
                            position: "relative",
                        }}
                    >
                        <div
                            class={[
                                styles.fpsCounter,
                                styles.fpsCounterVariants[
                                    getFPS().average >= 59.5 ? "good" : getFPS().average >= 29.5 ? "mid" : "bad"
                                ],
                            ].join(" ")}
                        >{`FPS: ${getFPS().current.toFixed(1)}\nAVG: ${getFPS().average.toFixed(1)}`}</div>
                        <div
                            class={styles.itemGrid}
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
