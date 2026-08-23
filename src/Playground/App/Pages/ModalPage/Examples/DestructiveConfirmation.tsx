import { createSignal } from "solid-js";

import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../../Lib/Fundamentals/Modal/Modal";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalScrim } from "../../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalHint, PageModalPanel } from "../../../StyledComponents/ModalPanel/ModalPanel";
import type { ModalDestructiveExampleProps } from "../ModalPage.types";

import * as styles from "../ModalPage.css";

const ALERT_TITLE_ID = "modal-page-alert-title";
const ALERT_BODY_ID = "modal-page-alert-body";

type Props = ModalDestructiveExampleProps;

export const DestructiveConfirmationExample = (props: Props) => {
    const [getCancelRef, setCancelRef] = createSignal<HTMLElement>();

    const decide = (outcome: string) => {
        props.onDecide(outcome);
        props.visibilitySignal[1](false);
    };

    return (
        <>
            <Button
                renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Delete the project</PageButtonContent>}
                onClick={() => {
                    props.onDecide("nothing decided yet");
                    props.visibilitySignal[1](true);
                }}
            />

            <Modal
                visibilitySignal={props.visibilitySignal}
                role={"alertdialog"}
                initialFocusRef={getCancelRef}
                isDismissableOnOverlayClick={false}
                ariaLabelledBy={() => ALERT_TITLE_ID}
                ariaDescribedBy={() => ALERT_BODY_ID}
                renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalScrim
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    />
                )}
                renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                    <PageModalPanel
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    >
                        <div id={ALERT_TITLE_ID}>Delete this project?</div>

                        <PageModalHint id={() => ALERT_BODY_ID}>
                            Clicking the overlay does nothing here — an alert has to be answered.
                        </PageModalHint>

                        <div class={styles.buttons}>
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>Delete</PageButtonContent>
                                )}
                                onClick={() => decide("deleted")}
                            />

                            <Button
                                ref={setCancelRef}
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>Cancel</PageButtonContent>
                                )}
                                onClick={() => decide("cancelled")}
                            />
                        </div>
                    </PageModalPanel>
                )}
            />
        </>
    );
};
