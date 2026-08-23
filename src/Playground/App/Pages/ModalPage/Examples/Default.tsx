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
            tooltipDefs={() => ({
                placement: () => ({ x: "center", y: "top-out" }),
                offset: () => ({ x: 0, y: 5 }),
                renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                    <PageTooltipContent
                        visibilityTarget={getVisibilityTarget}
                        transitionDurationMs={getTransitionDurationMs}
                    >
                        Click me to open a Modal.
                    </PageTooltipContent>
                ),
            })}
            id={"openModal"}
            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Open Modal</PageButtonContent>}
            onClick={() => {
                props.visibilitySignal[1](true);
            }}
        />

        <Modal
            visibilitySignal={props.visibilitySignal}
            ariaLabelledBy={() => MODAL_TITLE_ID}
            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageModalScrim visibilityTarget={getVisibilityTarget} transitionDurationMs={getTransitionDurationMs} />
            )}
            renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageModalPanel visibilityTarget={getVisibilityTarget} transitionDurationMs={getTransitionDurationMs}>
                    <div id={MODAL_TITLE_ID}>I am a Modal.</div>
                    <div>And I focus trap!</div>

                    <div class={styles.buttons}>
                        {FOCUS_CAPTIONS.map((caption) => (
                            <Button
                                renderContent={(getFlags) => (
                                    <PageButtonContent flags={getFlags}>{caption}</PageButtonContent>
                                )}
                            />
                        ))}
                    </div>
                </PageModalPanel>
            )}
        />
    </>
);
