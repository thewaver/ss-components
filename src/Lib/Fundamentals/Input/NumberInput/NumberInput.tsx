import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import { TextField } from "../TextField/TextField";
import type { TextFieldMode } from "../TextField/TextField.types";
import type { NumberInputProps, NumberInputStepDefs, NumberInputStepper } from "./NumberInput.types";
import { NumberInputUtils } from "./NumberInput.utils";

const DEFAULT_NUMBER_INPUT_STEP = 1;
const DEFAULT_NUMBER_INPUT_MODE: TextFieldMode = "decimal";

export const NumberInput = (props: NumberInputProps) => {
    const textSignal = createSignal(NumberInputUtils.formatValue(props.valueSignal[0]()));

    const getStepDefs = createMemo((): NumberInputStepDefs => ({
        min: props.getMin?.(),
        max: props.getMax?.(),
        step: props.getStep?.() ?? DEFAULT_NUMBER_INPUT_STEP,
    }));

    const getIsWritable = () => !(props.getIsDisabled?.() ?? false) && !(props.getIsReadOnly?.() ?? false);

    const reportValue = (value: number | undefined) => {
        props.valueSignal[1](value);

        void props.onInput?.(value);
    };

    const applyValue = (value: number | undefined) => {
        textSignal[1](NumberInputUtils.formatValue(value));

        reportValue(value);
    };

    const stepValue = (direction: 1 | -1) => {
        if (!getIsWritable()) return;

        applyValue(NumberInputUtils.computeStep(props.valueSignal[0](), direction, getStepDefs()));
    };

    const stepper: NumberInputStepper = {
        getIsAtMin: () => {
            const value = props.valueSignal[0]();
            const min = getStepDefs().min;

            return min !== undefined && value !== undefined && value <= min;
        },
        getIsAtMax: () => {
            const value = props.valueSignal[0]();
            const max = getStepDefs().max;

            return max !== undefined && value !== undefined && value >= max;
        },
        stepUp: () => stepValue(1),
        stepDown: () => stepValue(-1),
    };

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (NumberInputUtils.parseValue(untrack(textSignal[0])) === value) return;

        textSignal[1](NumberInputUtils.formatValue(value));
    });

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getType={() => "text"}
            getInputMode={() => props.getInputMode?.() ?? DEFAULT_NUMBER_INPUT_MODE}
            getIsSpinButton={() => true}
            renderTrailing={props.renderTrailing && ((getFlags) => props.renderTrailing!(getFlags, stepper))}
            onInput={(text) => {
                const sanitized = NumberInputUtils.sanitizeText(text);

                textSignal[1](sanitized);

                reportValue(NumberInputUtils.parseValue(sanitized));
            }}
            onKeyDown={(e) => {
                if (!getIsWritable()) return;

                const { min, max } = getStepDefs();

                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    stepValue(1);
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    stepValue(-1);
                } else if (e.key === "Home" && min !== undefined) {
                    e.preventDefault();
                    applyValue(min);
                } else if (e.key === "End" && max !== undefined) {
                    e.preventDefault();
                    applyValue(max);
                }
            }}
            onBlur={() => {
                const value = NumberInputUtils.parseValue(textSignal[0]());

                applyValue(value === undefined ? undefined : NumberInputUtils.clampValue(value, getStepDefs()));
            }}
        />
    );
};
