import { For, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import type { ExamplesProps } from "./Examples.types";

import * as pageStyles from "../../Pages/Pages.css";
import * as styles from "./Examples.css";

export const PageExamples = (props: ExamplesProps) => {
    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const [getIsModalOpen, setIsModalOpen] = createSignal(false);

    return (
        <>
            <div class={styles.examplesRoot}>
                <For each={props.getItems()}>
                    {(example, getExampleIndex) => (
                        <div class={styles.exampleContainer}>
                            <div class={styles.exampleTitle}>
                                {`${example.name}:`}
                                {example.src && (
                                    <Button
                                        getTooltipDefs={() => ({
                                            getPlacement: () => ({ x: "center", y: "top-out" }),
                                            getOffset: () => ({ x: 0, y: 5 }),
                                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                <div
                                                    class={pageStyles.tooltipContent}
                                                    classList={{ [pageStyles.isVisible]: getVisibilityTarget() === 1 }}
                                                    style={{ transition: `opacity ${getTransitionDurationMs()}ms` }}
                                                >
                                                    View source code
                                                </div>
                                            ),
                                        })}
                                        onClick={async () => {
                                            setActiveIndex(getExampleIndex());
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        {"</>"}
                                    </Button>
                                )}
                            </div>

                            {example.component()}
                        </div>
                    )}
                </For>
            </div>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                getIsVisible={getIsModalOpen}
                onHide={() => {
                    setIsModalOpen(false);
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
                        class={getVisibilityTarget() === 1 ? pageStyles.modalOn : pageStyles.modalOff}
                        style={{
                            transition: `transform ${getTransitionDurationMs()}ms`,
                            background: "none",
                        }}
                    >
                        <div class={pageStyles.codeBoxOutter}>
                            <div class={pageStyles.codeBoxInner} innerHTML={props.getItems()[getActiveIndex()].src} />
                        </div>
                        <div class={pageStyles.modalHint}>{"tap anywhere to close"}</div>
                    </div>
                )}
            />
        </>
    );
};
