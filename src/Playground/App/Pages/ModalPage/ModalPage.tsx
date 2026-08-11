import { createMemo, createSignal } from "solid-js";

import { Button } from "../../../../Lib/Fundamentals/Button/Button";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../Lib/Fundamentals/Input/Select/Select.types";
import { Modal } from "../../../../Lib/Fundamentals/Modal/Modal";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageButtonContent } from "../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalScrim } from "../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalHint, PageModalPanel } from "../../StyledComponents/ModalPanel/ModalPanel";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent } from "../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../StyledComponents/SelectOptionContent/SelectOptionContent";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import * as styles from "./ModalPage.css";

const MODAL_TITLE_ID = "modal-page-title";
const LAYERED_TITLE_ID = "modal-page-layered-title";
const ALERT_TITLE_ID = "modal-page-alert-title";
const ALERT_BODY_ID = "modal-page-alert-body";

const COUNTRIES: SelectOption<string>[] = [{ value: "Denmark" }, { value: "Portugal" }, { value: "Sweden" }];

export const ModalPage = () => {
    const modalVisibility = createSignal(false);
    const destructiveVisibility = createSignal(false);
    const layeredVisibility = createSignal(false);
    const layeredSignal = createSignal<string | undefined>();

    const [getCancelRef, setCancelRef] = createSignal<HTMLElement>();
    const [getOutcome, setOutcome] = createSignal("nothing decided yet");

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `open: ${modalVisibility[0]()} — Escape and an overlay click both dismiss it`,
                component: () => (
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
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Open Modal</PageButtonContent>
                            )}
                            onClick={() => {
                                modalVisibility[1](true);
                            }}
                        />

                        <Modal
                            visibilitySignal={modalVisibility}
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
                    </>
                ),
            },
            {
                name: "Destructive confirmation",
                readout: () =>
                    `open: ${destructiveVisibility[0]()} | outcome: ${getOutcome()} — the alertdialog role, a required focus target, and no overlay dismissal`,
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

                        <Modal
                            visibilitySignal={destructiveVisibility}
                            getRole={() => "alertdialog"}
                            getInitialFocusRef={getCancelRef}
                            getIsDismissableOnOverlayClick={() => false}
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
            {
                name: "A popup inside it",
                readout: () =>
                    `open: ${layeredVisibility[0]()} | country: ${layeredSignal[0]() ?? "undefined"} — Escape closes the innermost layer only`,
                component: () => (
                    <>
                        <Button
                            renderContent={(getFlags) => (
                                <PageButtonContent getFlags={getFlags}>Open layers</PageButtonContent>
                            )}
                            onClick={() => {
                                layeredVisibility[1](true);
                            }}
                        />

                        <Modal
                            visibilitySignal={layeredVisibility}
                            getAriaLabelledBy={() => LAYERED_TITLE_ID}
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
                                    <div id={LAYERED_TITLE_ID}>Where are you flying from?</div>

                                    <Select
                                        valueSignal={layeredSignal}
                                        getOptions={() => COUNTRIES}
                                        getAriaLabel={() => "Country"}
                                        renderContent={(getSelectedOption, getFlags) => (
                                            <PageSelectContent getFlags={getFlags}>
                                                {getSelectedOption()?.value ?? "Pick one"}
                                            </PageSelectContent>
                                        )}
                                        renderOption={(getOption, getFlags) => (
                                            <PageSelectOptionContent getFlags={getFlags}>
                                                {getOption().value}
                                            </PageSelectOptionContent>
                                        )}
                                        renderPopup={(
                                            renderOptions,
                                            getPopupVisibilityTarget,
                                            getPopupTransitionDurationMs,
                                            getPlacement,
                                        ) => (
                                            <PagePopoverSurface
                                                getVisibilityTarget={getPopupVisibilityTarget}
                                                getTransitionDurationMs={getPopupTransitionDurationMs}
                                                getPlacement={getPlacement}
                                            >
                                                {renderOptions()}
                                            </PagePopoverSurface>
                                        )}
                                    />
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
