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
            getId={() => "openLayers"}
            renderContent={(getFlags) => <PageButtonContent getFlags={getFlags}>Open layers</PageButtonContent>}
            onClick={() => {
                props.visibilitySignal[1](true);
            }}
        />

        <Modal
            visibilitySignal={props.visibilitySignal}
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
                        valueSignal={props.valueSignal}
                        getOptions={() => COUNTRIES}
                        getAriaLabel={() => "Country"}
                        renderContent={(getSelectedOption, getFlags) => (
                            <PageSelectContent getFlags={getFlags}>
                                {getSelectedOption()?.value ?? "Pick one"}
                            </PageSelectContent>
                        )}
                        renderOption={(getOption, getFlags) => (
                            <PageSelectOptionContent getFlags={getFlags}>{getOption().value}</PageSelectOptionContent>
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
);
