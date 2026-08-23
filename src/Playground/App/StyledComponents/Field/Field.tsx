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
import { access } from "../../../../Lib/Utils/propUtils";
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
        visibilityTarget={getVisibilityTarget}
        transitionDurationMs={getTransitionDurationMs}
        placement={getPlacement}
    >
        {renderOptions()}
    </PagePopoverSurface>
);

export const PageNumberField = (props: PageNumberFieldProps) => {
    const valueSignal = SignalMirror.createValueMirror<number | undefined>(
        () => access(props.value),
        (value) => {
            if (value === undefined) return;

            props.onInput(value);
        },
    );

    return (
        <NumberInput
            valueSignal={valueSignal}
            id={props.id}
            min={props.min}
            max={props.max}
            step={props.step}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            padding={() => FIELD_STEPPER_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => (
                <PageTextFieldContent
                    flags={getFlags}
                    width={() => access(props.width) ?? DEFAULT_NUMBER_FIELD_WIDTH}
                />
            )}
            renderTrailing={(getFlags, stepper) => <PageNumberInputStepper flags={getFlags} stepper={stepper} />}
            onInput={(value) => {
                if (value === undefined) return;

                props.onInput(clampToRange(value, access(props.min), access(props.max)));
            }}
        />
    );
};

export const PageTextField = (props: PageTextFieldProps) => {
    const textSignal = SignalMirror.createValueMirror(() => access(props.value), props.onInput);

    return (
        <TextInput
            valueSignal={textSignal}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            padding={() => FIELD_PADDING}
            gap={() => FIELD_GAP}
            computeTextStyle={computePageTextFieldTextStyle}
            renderContent={(getFlags) => <PageTextFieldContent flags={getFlags} width={props.width} />}
            renderPlaceholder={
                props.placeholder === undefined
                    ? undefined
                    : (getFlags) => (
                          <PageTextFieldPlaceholder flags={getFlags}>
                              {access(props.placeholder)}
                          </PageTextFieldPlaceholder>
                      )
            }
        />
    );
};

export const PageSelectField = <T,>(props: PageSelectFieldProps<T>) => {
    const getValue = () => access(props.value);

    const valueSignal: Signal<T | undefined> = SignalMirror.createValueMirror<T | undefined>(getValue, (value) => {
        if (value === undefined) return;

        props.onChange(value);
    });

    return (
        <Select
            valueSignal={valueSignal}
            options={() => access(props.values).map((value) => ({ value }))}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent flags={getFlags} width={() => access(props.width) ?? DEFAULT_SELECT_FIELD_WIDTH}>
                    {getSelectedOption() !== undefined
                        ? (props.computeLabel?.(getSelectedOption()!.value) ?? String(getSelectedOption()!.value))
                        : EMPTY_TEXT}
                </PageSelectContent>
            )}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent flags={getFlags}>
                    {props.computeLabel?.(getOption().value) ?? String(getOption().value)}
                </PageSelectOptionContent>
            )}
            renderPopup={renderFieldPopup}
        />
    );
};

export const PageGroupedSelectField = <T,>(props: PageGroupedSelectFieldProps<T>) => {
    const getValue = () => access(props.value);

    const valueSignal: Signal<T | undefined> = SignalMirror.createValueMirror<T | undefined>(getValue, (value) => {
        if (value === undefined) return;

        props.onChange(value);
    });

    return (
        <Select
            valueSignal={valueSignal}
            options={() =>
                access(props.groups).map(([label, values]) => ({ label, options: values.map((value) => ({ value })) }))
            }
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            renderContent={(getSelectedOption, getFlags) => (
                <PageSelectContent flags={getFlags} width={() => access(props.width) ?? DEFAULT_SELECT_FIELD_WIDTH}>
                    {getSelectedOption() !== undefined
                        ? (props.computeLabel?.(getSelectedOption()!.value) ?? String(getSelectedOption()!.value))
                        : EMPTY_TEXT}
                </PageSelectContent>
            )}
            renderGroup={(getGroup) => <PageSelectGroupContent>{getGroup().label}</PageSelectGroupContent>}
            renderOption={(getOption, getFlags) => (
                <PageSelectOptionContent flags={getFlags}>
                    {props.computeLabel?.(getOption().value) ?? String(getOption().value)}
                </PageSelectOptionContent>
            )}
            renderPopup={renderFieldPopup}
        />
    );
};

export const PageCheckField = (props: PageCheckFieldProps) => {
    const checkedSignal = SignalMirror.createValueMirror(() => access(props.value), props.onChange);

    return (
        <Checkbox
            checkedSignal={checkedSignal}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            renderContent={(getFlags) => <PageCheckboxContent flags={getFlags} />}
        />
    );
};

export const PageColorField = (props: PageColorFieldProps) => {
    const valueSignal = SignalMirror.createValueMirror(() => access(props.value), props.onInput);

    return (
        <ColorInput
            valueSignal={valueSignal}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            renderContent={(getFlags) => <PageColorInputContent flags={getFlags} isCompact={true} />}
            {...pageColorPickerSlots}
        />
    );
};

export const PageFileField = (props: PageFileFieldProps) => {
    const filesSignal = createSignal<File[]>([]);

    return (
        <FileInput
            filesSignal={filesSignal}
            accept={props.accept}
            isDisabled={props.isDisabled}
            ariaLabel={props.ariaLabel}
            renderContent={(getFlags) => <PageFileInputContent flags={getFlags} />}
            onChange={(files) => {
                if (!files.length) return;

                props.onPick(files[0]);
            }}
        />
    );
};
