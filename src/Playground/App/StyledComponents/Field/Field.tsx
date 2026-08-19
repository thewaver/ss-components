import type { JSX, Signal } from "solid-js";
import { createSignal } from "solid-js";

import type { AnchorPlacement } from "../../../../Lib/Abstracts/Anchor/Anchor.types";
import { SignalMirror } from "../../../../Lib/Abstracts/SignalMirror/SignalMirror";
import { Checkbox } from "../../../../Lib/Fundamentals/Input/Checkbox/Checkbox";
import { ColorInput } from "../../../../Lib/Fundamentals/Input/ColorInput/ColorInput";
import { FileInput } from "../../../../Lib/Fundamentals/Input/FileInput/FileInput";
import { NumberInput } from "../../../../Lib/Fundamentals/Input/NumberInput/NumberInput";
import { Select } from "../../../../Lib/Fundamentals/Input/Select/Select";
import { TextInput } from "../../../../Lib/Fundamentals/Input/TextInput/TextInput";
import { PageCheckboxContent } from "../../StyledComponents/CheckboxContent/CheckboxContent";
import { pageColorPickerSlots } from "../../StyledComponents/ColorAreaContent/ColorAreaContent";
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

const DEFAULT_NUMBER_FIELD_WIDTH = 100;
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
    const valueSignal = SignalMirror.createValueMirror<number | undefined>(props.getValue, (value) => {
        if (value === undefined) return;

        props.onInput(value);
    });

    return (
        <NumberInput
            valueSignal={valueSignal}
            getId={props.getId}
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
    const textSignal = SignalMirror.createValueMirror(props.getValue, props.onInput);

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
        />
    );
};

export const PageSelectField = <T,>(props: PageSelectFieldProps<T>) => {
    const valueSignal: Signal<T | undefined> = SignalMirror.createValueMirror<T | undefined>(
        props.getValue,
        (value) => {
            if (value === undefined) return;

            props.onChange(value);
        },
    );

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
        />
    );
};

export const PageGroupedSelectField = <T,>(props: PageGroupedSelectFieldProps<T>) => {
    const valueSignal: Signal<T | undefined> = SignalMirror.createValueMirror<T | undefined>(
        props.getValue,
        (value) => {
            if (value === undefined) return;

            props.onChange(value);
        },
    );

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
        />
    );
};

export const PageCheckField = (props: PageCheckFieldProps) => {
    const checkedSignal = SignalMirror.createValueMirror(props.getValue, props.onChange);

    return (
        <Checkbox
            checkedSignal={checkedSignal}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getFlags) => <PageCheckboxContent getFlags={getFlags} />}
        />
    );
};

export const PageColorField = (props: PageColorFieldProps) => {
    const valueSignal = SignalMirror.createValueMirror(props.getValue, props.onInput);

    return (
        <ColorInput
            valueSignal={valueSignal}
            getIsDisabled={props.getIsDisabled}
            getAriaLabel={props.getAriaLabel}
            renderContent={(getFlags) => <PageColorInputContent getFlags={getFlags} getIsCompact={() => true} />}
            {...pageColorPickerSlots}
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
