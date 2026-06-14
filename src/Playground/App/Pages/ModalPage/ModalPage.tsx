import { createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";

import * as pageStyles from "../Pages.css";
import * as styles from "./ModalPage.css";

export const ModalPage = () => {
    const [getModalOpen, setModalOpen] = createSignal(false);

    return (
        <div class={styles.root}>
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
                            Click me to open a Modal.
                        </div>
                    ),
                })}
                onClick={async () => {
                    setModalOpen(true);
                }}
            >
                <div class={pageStyles.buttonContent}>Open Modal</div>
            </Button>

            <Modal
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
                        <div>I am a Modal.</div>
                        <div>And I focus trap!</div>
                        <div class={styles.buttons}>
                            <Button>
                                <div class={pageStyles.buttonContent}>Focus 1</div>
                            </Button>
                            <Button>
                                <div class={pageStyles.buttonContent}>Focus 2</div>
                            </Button>
                            <Button>
                                <div class={pageStyles.buttonContent}>Focus 3</div>
                            </Button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};
