import { For, createSignal } from "solid-js";

import { CSSUtils } from "@thewaver/ss-utils";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalHint } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";
import { PageCodeBox } from "../CodeBox/CodeBox";
import type { ExamplesProps } from "./Examples.types";

import * as styles from "./Examples.css";

export const PageExamples = (props: ExamplesProps) => {
    const [getActiveIndex, setActiveIndex] = createSignal(0);
    const modalVisibility = createSignal(false);
    const [, setIsModalOpen] = modalVisibility;

    return (
        <>
            <div class={styles.examplesRoot}>
                <For each={props.getItems()}>
                    {(example, getExampleIndex) => (
                        <div class={styles.exampleContainer} data-example={example.name}>
                            <div class={styles.exampleTitle}>
                                {`${example.name}:`}
                                {example.src && (
                                    <Button
                                        getTooltipDefs={() => ({
                                            getPlacement: () => ({ x: "center", y: "top-out" }),
                                            getOffset: () => ({ x: 0, y: 5 }),
                                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                                <PageTooltipContent
                                                    getVisibilityTarget={getVisibilityTarget}
                                                    getTransitionDurationMs={getTransitionDurationMs}
                                                >
                                                    View source code
                                                </PageTooltipContent>
                                            ),
                                        })}
                                        onClick={async () => {
                                            setActiveIndex(getExampleIndex());
                                            setIsModalOpen(true);
                                        }}
                                        renderContent={() => "</>"}
                                    />
                                )}
                            </div>

                            {example.component()}

                            {example.readout && (
                                <div class={styles.exampleReadout} data-readout>
                                    {example.readout()}
                                </div>
                            )}
                        </div>
                    )}
                </For>
            </div>

            <Modal
                getMargins={() => CSSUtils.spreadMargin(40)}
                visibilitySignal={modalVisibility}
                getAriaLabel={() => `${props.getItems()[getActiveIndex()].name} source code`}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <div
                        class={getVisibilityTarget() === 1 ? styles.sourceModalOn : styles.sourceModalOff}
                        style={{ transition: `transform ${getTransitionDurationMs()}ms` }}
                    >
                        <PageCodeBox getSource={() => props.getItems()[getActiveIndex()].src} />
                        <PageModalHint>{"tap anywhere to close"}</PageModalHint>
                    </div>
                )}
            />
        </>
    );
};
