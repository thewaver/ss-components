import { For, createMemo, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { FPSUtils } from "../../../../Lib/Abstracts/FPS/FPS.utils";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { access } from "../../../../Lib/Utils/propUtils";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PagePropsPanel } from "../PropsPanel/PropsPanel";
import type { StressTestProps } from "./StressText.types";

import * as styles from "./StressTest.css";

export const StressTest = (props: StressTestProps) => {
    const modalVisibility = createSignal(false);
    const [getModalOpen, setModalOpen] = modalVisibility;
    const [getModalTransitionFinished, setModalTransitionFinished] = createSignal(false);
    const [getConfigIndex, setConfigIndex] = createSignal(0);

    const getArr = createMemo(() =>
        Array.from({ length: access(props.configs)[getConfigIndex()].count }, (_, idx) => idx),
    );

    const getIsMonitoringDisabled = createMemo(() => {
        const isOpen = getModalOpen();
        const isStable = getModalTransitionFinished();

        return !(isOpen && isStable);
    });

    const { getFPS } = FPSUtils.createMonitor(getIsMonitoringDisabled);

    return (
        <>
            <PagePropsPanel scope={"local"}>
                <For each={access(props.configs)}>
                    {(items, getIndex) => (
                        <Button
                            sizing={"fill"}
                            onClick={async () => {
                                setConfigIndex(getIndex());
                                setModalOpen(true);
                            }}
                            renderContent={(getFlags) => (
                                <PageButtonContent flags={getFlags}>{props.renderLabel(getIndex)}</PageButtonContent>
                            )}
                        />
                    )}
                </For>
            </PagePropsPanel>

            <Modal
                margins={() => CSSUtils.spreadMargin(40)}
                visibilitySignal={modalVisibility}
                ariaLabel={"Stress test"}
                onShow={props.onShowModal}
                onHide={props.onHideModal}
                onTransitionStatusChange={setModalTransitionFinished}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalPanel
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
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
                                "grid-template-columns": `repeat(${access(props.configs)[getConfigIndex()].cols}, auto)`,
                                "gap": `${access(props.configs)[getConfigIndex()].gap}px`,
                            }}
                        >
                            <For each={getArr()}>{(_, getIndex) => props.renderItem(getConfigIndex, getIndex)}</For>
                        </div>
                    </PageModalPanel>
                )}
            />
        </>
    );
};
