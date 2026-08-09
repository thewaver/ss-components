import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalOverlay } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as styles from "./ModalPage.css";

const MODAL_TITLE_ID = "modal-page-title";

export const ModalPage = () => {
    const modalVisibility = createSignal(false);
    const [, setModalOpen] = modalVisibility;

    return (
        <div class={styles.root}>
            <Button
                getTooltipDefs={() => ({
                    getPlacement: () => ({ x: "center", y: "top-out" }),
                    getOffset: () => ({ x: 0, y: 5 }),
                    renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                        <PageTooltipContent
                            getVisibilityTarget={getVisibilityTarget}
                            getTransitionDurationMs={getTransitionDurationMs}
                        >
                            Click me to open a Modal.
                        </PageTooltipContent>
                    ),
                })}
                renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Open Modal</PageButtonContent>}
                onClick={async () => {
                    setModalOpen(true);
                }}
            />

            <Modal
                visibilitySignal={modalVisibility}
                getAriaLabelledBy={() => MODAL_TITLE_ID}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalOverlay
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalPanel
                        getVisibilityTarget={getVisibilityTarget}
                        getTransitionDurationMs={getTransitionDurationMs}
                    >
                        <div id={MODAL_TITLE_ID}>I am a Modal.</div>
                        <div>And I focus trap!</div>
                        <div class={styles.buttons}>
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>Focus 1</PageButtonContent>
                                )}
                            />
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>Focus 2</PageButtonContent>
                                )}
                            />
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>Focus 3</PageButtonContent>
                                )}
                            />
                        </div>
                    </PageModalPanel>
                )}
            />
        </div>
    );
};
