import { Button } from "../../../../../Lib/Fundamentals/Button/Button";
import { Select } from "../../../../../Lib/Fundamentals/Input/Select/Select";
import type { SelectOption } from "../../../../../Lib/Fundamentals/Input/Select/Select.types";
import { Modal } from "../../../../../Lib/Fundamentals/Modal/Modal";
import { PageButtonContent } from "../../../StyledComponents/ButtonContent/ButtonContent";
import { PageModalScrim } from "../../../StyledComponents/ModalOverlay/ModalOverlay";
import { PageModalPanel } from "../../../StyledComponents/ModalPanel/ModalPanel";
import { PagePopoverSurface } from "../../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent } from "../../../StyledComponents/SelectContent/SelectContent";
import { PageSelectOptionContent } from "../../../StyledComponents/SelectOptionContent/SelectOptionContent";
import type { ModalLayeredExampleProps } from "../ModalPage.types";

const LAYERED_TITLE_ID = "modal-page-layered-title";

const COUNTRIES: SelectOption<string>[] = [{ value: "Denmark" }, { value: "Portugal" }, { value: "Sweden" }];

type Props = ModalLayeredExampleProps;

export const LayeredExample = (props: Props) => (
    <>
        <Button
            id={"openLayers"}
            renderContent={(getFlags) => <PageButtonContent flags={getFlags}>Open layers</PageButtonContent>}
            onClick={() => {
                props.visibilitySignal[1](true);
            }}
        />

        <Modal
            visibilitySignal={props.visibilitySignal}
            ariaLabelledBy={() => LAYERED_TITLE_ID}
            renderOverlay={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageModalScrim visibilityTarget={getVisibilityTarget} transitionDurationMs={getTransitionDurationMs} />
            )}
            renderContent={(getVisibilityTarget, getTransitionDurationMs) => (
                <PageModalPanel visibilityTarget={getVisibilityTarget} transitionDurationMs={getTransitionDurationMs}>
                    <div id={LAYERED_TITLE_ID}>Where are you flying from?</div>

                    <Select
                        valueSignal={props.valueSignal}
                        options={() => COUNTRIES}
                        ariaLabel={"Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent flags={getFlags}>
                                {getSelectedOption()?.value ?? "Pick one"}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent flags={getFlags}>{getOption().value}</PageSelectOptionContent>
                        )}
                        renderPopup={(
                            renderOptions,
                            getPopupVisibilityTarget,
                            getPopupTransitionDurationMs,
                            getPlacement,
                        ) => (
                            <PagePopoverSurface
                                visibilityTarget={getPopupVisibilityTarget}
                                transitionDurationMs={getPopupTransitionDurationMs}
                                placement={getPlacement}
                            >
                                {renderOptions()}
                            </PagePopoverSurface>
                        )}
                    />
                </PageModalPanel>
            )}
        />
    </>
);
