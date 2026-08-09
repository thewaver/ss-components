import type { JSX, Signal } from "solid-js";
import { createEffect, createSignal } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { Checkbox } from "../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { ColorInput } from "../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { FileInput } from "../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { NumberInput } from "../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import { TextInput } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageCheckboxContent } from "../../StyledComponents/CheckboxContent/CheckboxContent";
import { PageColorInputContent } from "../../StyledComponents/ColorInputContent/ColorInputContent";
import { PageFileInputContent } from "../../StyledComponents/FileInputContent/FileInputContent";
import { PageNumberInputStepper } from "../../StyledComponents/NumberInputStepper/NumberInputStepper";
import { PagePopoverSurface } from "../../StyledComponents/PopoverSurface/PopoverSurface";
import { PageSelectContent } from "../../StyledComponents/SelectContent/SelectContent";
import { PageSelectGroupContent } from "../../StyledComponents/SelectGroupContent/SelectGroupContent";
import { PageSelectOptionContent } from "../../StyledComponents/SelectOptionContent/SelectOptionContent";
import {
    PageTextFieldContent,
    computePageTextFieldTextStyle,
} from "../../StyledComponents/TextFieldContent/TextFieldContent";
import { PageTextFieldPlaceholder } from "../../StyledComponents/TextFieldPlaceholder/TextFieldPlaceholder";
import type {
    PageCheckFieldProps,
    PageColorFieldProps,
    PageFileFieldProps,
    PageGroupedSelectFieldProps,
    PageNumberFieldProps,
    PageSelectFieldProps,
    PageTextFieldProps,
} from "./Field.types";

import {
    FIELD_GAP,
    FIELD_PADDING,
    FIELD_STEPPER_PADDING,
} from "../../StyledComponents/TextFieldContent/TextFieldContent.css";

const DEFAULT_NUMBER_FIELD_WIDTH = 130;
const DEFAULT_SELECT_FIELD_WIDTH = 150;
const EMPTY_TEXT = "";

const clampToRange = (value: number, min?: number, max?: number) => {
    const floored = min === undefined ? value : Math.max(value, min);

    return max === undefined ? floored : Math.min(floored, max);
};

const renderFieldPopup = (
    renderOptions: () => JSX.Element,
    getVisibilityTarget: () => 0 | 1,
    getTransitionDurationMs: () => number,
    getPlacement: () => AnchorPlacement,
) => (
    <PagePopoverSurface
        getVisibilityTarget={getVisibilityTarget}
        getTransitionDurationMs={getTransitionDurationMs}
        getPlacement={getPlacement}
    >
        {renderOptions()}
    </PagePopoverSurface>
);

export const PageNumberField = (props: PageNumberFieldProps) => {
    const valueSignal = createSignal<number | undefined>(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (valueSignal[0]() === value) return;

        valueSignal[1](value);
    });

    return (
        <NumberInput
            valueSignal={valueSignal}
            getMin={props.getMin}
            getMax={props.getMax}
            getStep={props.getStep}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            getPadding={() => FIELD_STEPPER_PADDING}
            getGap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => (
                <PageTextFieldContent
                    getFlags={getFlags}
                    getWidth={() => props.getWidth?.() ?? DEFAULT_NUMBER_FIELD_WIDTH}
                />
            )}
            renderTrailing={(getFlags, stepper) => <PageNumberInputStepper getFlags={getFlags} stepper={stepper} />}
            onInput={(value) => {
                if (value === undefined) return;

                props.onInput(clampToRange(value, props.getMin?.(), props.getMax?.()));
            }}
        />
    );
};

export const PageTextField = (props: PageTextFieldProps) => {
    const textSignal = createSignal(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (textSignal[0]() === value) return;

        textSignal[1](value);
    });

    return (
        <TextInput
            valueSignal={textSignal}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            getPadding={() => FIELD_PADDING}
            getGap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent getFlags={getFlags} getWidth={props.getWidth} />}
            renderPlaceholder={
                props.getPlaceholder &&
                ((getFlags) => (
                    <PageTextFieldPlaceholder getFlags={getFlags}>{props.getPlaceholder!()}</PageTextFieldPlaceholder>
                ))
            }
            onInput={props.onInput}
        />
    );
};

export const PageSelectField = <T,>(props: PageSelectFieldProps<T>) => {
    const valueSignal: Signal<T | undefined> = createSignal<T | undefined>(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (valueSignal[0]() === value) return;

        valueSignal[1](() => value);
    });

    return (
        <Select
            valueSignal={valueSignal}
            getOptions={() => props.getValues().map((value) => ({ value }))}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent
                    getFlags={getFlags}
                    getWidth={() => props.getWidth?.() ?? DEFAULT_SELECT_FIELD_WIDTH}
                >
                    {getSelectedOption() !== undefined
                        ? (props.computeLabel?.(getSelectedOption()!.value) ?? String(getSelectedOption()!.value))
                        : EMPTY_TEXT}
                </PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent getFlags={getFlags}>
                    {props.computeLabel?.(getOption().value) ?? String(getOption().value)}
                </PageSelectOptionContent>
            )}
            renderPopup={renderFieldPopup}
            onSelectionChange={(value) => {
                if (value === undefined) return;

                props.onChange(value);
            }}
        />
    );
};

export const PageGroupedSelectField = <T,>(props: PageGroupedSelectFieldProps<T>) => {
    const valueSignal: Signal<T | undefined> = createSignal<T | undefined>(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (valueSignal[0]() === value) return;

        valueSignal[1](() => value);
    });

    return (
        <Select
            valueSignal={valueSignal}
            getOptions={() =>
                props.getGroups().map(([label, values]) => ({ label, options: values.map((value) => ({ value })) }))
            }
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent
                    getFlags={getFlags}
                    getWidth={() => props.getWidth?.() ?? DEFAULT_SELECT_FIELD_WIDTH}
                >
                    {getSelectedOption() !== undefined
                        ? (props.computeLabel?.(getSelectedOption()!.value) ?? String(getSelectedOption()!.value))
                        : EMPTY_TEXT}
                </PageSelectContent>
            )}
            renderGroup={(getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent getFlags={getFlags}>
                    {props.computeLabel?.(getOption().value) ?? String(getOption().value)}
                </PageSelectOptionContent>
            )}
            renderPopup={renderFieldPopup}
            onSelectionChange={(value) => {
                if (value === undefined) return;

                props.onChange(value);
            }}
        />
    );
};

export const PageCheckField = (props: PageCheckFieldProps) => {
    const checkedSignal = createSignal(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (checkedSignal[0]() === value) return;

        checkedSignal[1](value);
    });

    return (
        <Checkbox
            checkedSignal={checkedSignal}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
            onChange={props.onChange}
        />
    );
};

export const PageColorField = (props: PageColorFieldProps) => {
    const valueSignal = createSignal(props.getValue());

    createEffect(() => {
        const value = props.getValue();

        if (valueSignal[0]() === value) return;

        valueSignal[1](value);
    });

    return (
        <ColorInput
            valueSignal={valueSignal}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} getIsCompact={() => true} />}
            onInput={props.onInput}
        />
    );
};

export const PageFileField = (props: PageFileFieldProps) => {
    const filesSignal = createSignal<File[]>([]);

    return (
        <FileInput
            filesSignal={filesSignal}
            getAccept={props.getAccept}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getFlags) => <PageFileInputContent getFlags={getFlags} />}
            onChange={(files) => {
                if (!files.length) return;

                props.onPick(files[0]);
            }}
        />
    );
};
