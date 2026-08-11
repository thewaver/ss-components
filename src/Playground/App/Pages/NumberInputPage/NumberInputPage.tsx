import { createMemo, createSignal } from "solid-js";

import { Label } from "../../../../Lib/Fundamentals/Input/Label/Label";
import { NumberInput } from "../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { PageVariants } from "../../PageComponents/Variants/Variants";
import { PageLabelCaption } from "../../StyledComponents/LabelCaption/LabelCaption";
import { PageNumberInputStepper } from "../../StyledComponents/NumberInputStepper/NumberInputStepper";
import { PageTextFieldAdornment } from "../../StyledComponents/TextFieldAdornment/TextFieldAdornment";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import { PageTooltipContent } from "../../StyledComponents/TooltipContent/TooltipContent";

import { FIELD_GAP, FIELD_STEPPER_PADDING } from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const QUANTITY_MIN = 0;
const QUANTITY_MAX = 100;
const QUANTITY_STEP = 5;
const RATING_MIN = 0;
const RATING_MAX = 5;
const RATING_STEP = 0.1;
const FIELD_WIDTH = 180;

export const NumberInputPage = () => {
    const defaultSignal = createSignal<number | undefined>(undefined);
    const quantitySignal = createSignal<number | undefined>(13);
    const ratingSignal = createSignal<number | undefined>(3.7);
    const unitSignal = createSignal<number | undefined>(72);
    const readOnlySignal = createSignal<number | undefined>(1024);
    const disabledSignal = createSignal<number | undefined>(7);
    const reachableSignal = createSignal<number | undefined>(7);
    const erroredSignal = createSignal<number | undefined>(0);
    const labelledSignal = createSignal<number | undefined>(undefined);

    const getVariants = createMemo(() => {
        return [
            {
                name: "Default",
                readout: () => `value: ${defaultSignal[0]()} — an empty field has no value at all`,
                component: () => (
                    <NumberInput
                        valueSignal={defaultSignal}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "How many"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderPlaceholder={(getFlags) => (
                            <PageTextFieldPlaceholder getFlags={getFlags}>How many</PageTextFieldPlaceholder>
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "Stepped and clamped",
                readout: () =>
                    `value: ${quantitySignal[0]()} — steps of ${QUANTITY_STEP} counted from ${QUANTITY_MIN}, typed values are clamped on blur`,
                component: () => (
                    <NumberInput
                        valueSignal={quantitySignal}
                        getMin={() => QUANTITY_MIN}
                        getMax={() => QUANTITY_MAX}
                        getStep={() => QUANTITY_STEP}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Quantity"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "Fractional step",
                readout: () => `value: ${ratingSignal[0]()} — a step of ${RATING_STEP} must not drift`,
                component: () => (
                    <NumberInput
                        valueSignal={ratingSignal}
                        getMin={() => RATING_MIN}
                        getMax={() => RATING_MAX}
                        getStep={() => RATING_STEP}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Rating"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "With a unit",
                readout: () => `value: ${unitSignal[0]()} — one slot holds both the unit and the stepper`,
                component: () => (
                    <NumberInput
                        valueSignal={unitSignal}
                        getMin={() => 0}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Width"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <>
                                <PageTextFieldAdornment getFlags={getFlags}>px</PageTextFieldAdornment>

                                <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                            </>
                        )}
                    />
                ),
            },
            {
                name: "Read-only",
                readout: () => `value: ${readOnlySignal[0]()} — the stepper is refused along with the keyboard`,
                component: () => (
                    <NumberInput
                        valueSignal={readOnlySignal}
                        getIsReadOnly={() => true}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Read-only amount"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "Disabled",
                readout: () => `value: ${disabledSignal[0]()}`,
                component: () => (
                    <NumberInput
                        valueSignal={disabledSignal}
                        getIsDisabled={() => true}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Disabled amount"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "Disabled + reachable",
                readout: () => `value: ${reachableSignal[0]()}`,
                component: () => (
                    <NumberInput
                        valueSignal={reachableSignal}
                        getIsDisabled={() => true}
                        getIsReachableWhenDisabled={() => true}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Disabled but reachable amount"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                        getTooltipDefs={() => ({
                            getPlacement: () => ({ x: "center", y: "top-out" }),
                            getOffset: () => ({ x: 0, y: 5 }),
                            renderContent: (getVisibilityTarget, getTransitionDurationMs) => (
                                <PageTooltipContent
                                    getVisibilityTarget={getVisibilityTarget}
                                    getTransitionDurationMs={getTransitionDurationMs}
                                >
                                    Focusable so this tooltip can be read, but neither the arrows nor the stepper may
                                    move the value.
                                </PageTooltipContent>
                            ),
                        })}
                    />
                ),
            },
            {
                name: "Error",
                readout: () => `value: ${erroredSignal[0]()} — anything but a positive count is an error`,
                component: () => (
                    <NumberInput
                        valueSignal={erroredSignal}
                        getMin={() => 0}
                        getHasError={() => (erroredSignal[0]() ?? 0) <= 0}
                        getPadding={() => FIELD_STEPPER_PADDING}
                        getGap={() => FIELD_GAP}
                        getAriaLabel={() => "Seats"}
                        computeTextStyle={computePageTextFieldTextStyle}
                        renderContent={(getFlags) => (
                            <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                        )}
                        renderTrailing={(getFlags, stepper) => (
                            <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                        )}
                    />
                ),
            },
            {
                name: "In a Label",
                readout: () => `value: ${labelledSignal[0]()}`,
                component: () => (
                    <Label getDir={() => "column"} getGap={() => 5}>
                        <PageLabelCaption>Guests</PageLabelCaption>

                        <NumberInput
                            valueSignal={labelledSignal}
                            getMin={() => 1}
                            getMax={() => 8}
                            getPadding={() => FIELD_STEPPER_PADDING}
                            getGap={() => FIELD_GAP}
                            computeTextStyle={computePageTextFieldTextStyle}
                            renderContent={(getFlags) => (
                                <PageTextFieldContent getFlags={getFlags} getWidth={() => FIELD_WIDTH} />
                            )}
                            renderTrailing={(getFlags, stepper) => (
                                <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />
                            )}
                        />
                    </Label>
                ),
            },
        ];
    });

    return <PageVariants getItems={getVariants} />;
};
