import { createMemo, createSignal } from "solid-js";

import { AlertDialog } from "../../../../Lib/Fundamentals/AlertDialog/AlertDialog";
import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalScrim } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalHint, PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";

import * as styles from "./AlertDialogPage.css";

const ALERT_TITLE_ID = "alert-dialog-title";
const ALERT_BODY_ID = "alert-dialog-body";

export const AlertDialogPage = () => {
    const destructiveVisibility = createSignal(false);

    const [getCancelRef, setCancelRef] = createSignal<HTMLElement>();
    const [getOutcome, setOutcome] = createSignal("nothing decided yet");

    const getVariants = createMemo(() => {
        return [
            {
                name: "Destructive confirmation",
                readout: () =>
                    `open: ${destructiveVisibility[0]()} | outcome: ${getOutcome()} — focus lands on Cancel, not on the first button`,
                component: () => (
                    <>
                        <Button
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Delete the project</PageButtonContent>
                            )}
                            onClick={() => {
                                setOutcome("nothing decided yet");
                                destructiveVisibility[1](true);
                            }}
                        />

                        <AlertDialog
                            visibilitySignal={destructiveVisibility}
                            getInitialFocusRef={getCancelRef}
                            getAriaLabelledBy={() => ALERT_TITLE_ID}
                            getAriaDescribedBy={() => ALERT_BODY_ID}
                            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                                <PageModalScrim
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                />
                            )}
                            renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                                <PageModalPanel
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    <div id={ALERT_TITLE_ID}>Delete this project?</div>

                                    <PageModalHint getId={() => ALERT_BODY_ID}>
                                        Clicking the overlay does nothing here — an alert has to be answered.
                                    </PageModalHint>

                                    <div class={styles.buttons}>
                                        <Button
                                            renderContent={(getFlags) => (
                                                <PageButtonContent getFlags={getFlags}>Delete</PageButtonContent>
                                            )}
                                            onClick={() => {
                                                setOutcome("deleted");
                                                destructiveVisibility[1](false);
                                            }}
                                        />

                                        <Button
                                            ref={setCancelRef}
                                            renderContent={(getFlags) => (
                                                <PageButtonContent getFlags={getFlags}>Cancel</PageButtonContent>
                                            )}
                                            onClick={() => {
                                                setOutcome("cancelled");
                                                destructiveVisibility[1](false);
                                            }}
                                        />
                                    </div>
                                </PageModalPanel>
                            )}
                        />
                    </>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
