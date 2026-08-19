import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Modal } from "../../../../../Lib/Fundamentals/Modal/Modal";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalScrim } from "../../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../../StyledComponents/ModalPanel/ModalPanel";
import { PageTooltipContent } from "../../../StyledComponents/TooltipContent/TooltipContent";
import type { ModalExampleProps } from "../ModalPage.types";

import * as styles from "../ModalPage.css";

const MODAL_TITLE_ID = "modal-page-title";
const FOCUS_CAPTIONS = ["Focus 1", "Focus 2", "Focus 3"];

type Props = ModalExampleProps;

export const DefaultExample = (props: Props) => (
    <>
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
            getId={() => "openModal"}
            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Open Modal</PageButtonContent>}
            onClick={() => {
                props.visibilitySignal[1](true);
            }}
        />

        <Modal
            visibilitySignal={props.visibilitySignal}
            getAriaLabelledBy={() => MODAL_TITLE_ID}
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
                    <div id={MODAL_TITLE_ID}>I am a Modal.</div>
                    <div>And I focus trap!</div>

                    <div class={styles.buttons}>
                        {FOCUS_CAPTIONS.map((caption) => (
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent getFlags={getFlags}>{caption}</PageButtonContent>
                                )}
                            />
                        ))}
                    </div>
                </PageModalPanel>
            )}
        />
    </>
);
