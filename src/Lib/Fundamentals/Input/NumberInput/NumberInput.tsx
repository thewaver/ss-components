import { createEffect, createMemo, createSignal, onCleanup, untrack } from "solid-js";

import { access } from "../../../Utils/propUtils";
import { TextField } from "../TextField/TextField";
import type { TextFieldMode } from "../TextField/TextField.types";
import type { NumberInputProps, NumberInputStepDefs, NumberInputStepper } from "./NumberInput.types";
import { NumberInputUtils } from "./NumberInput.utils";

const DEFAULT_NUMBER_INPUT_STEP = 1;
const DEFAULT_NUMBER_INPUT_MODE: TextFieldMode = "decimal";
const DEFAULT_NUMBER_INPUT_REPEAT_DELAY_MS = 400;
const DEFAULT_NUMBER_INPUT_REPEAT_INTERVAL_MS = 60;

export const NumberInput = (props: NumberInputProps) => {
    const textSignal = createSignal(NumberInputUtils.formatValue(props.valueSignal[0]()));

    const getStepDefs = createMemo((): NumberInputStepDefs => ({
        min: access(props.min),
        max: access(props.max),
        step: access(props.step) ?? DEFAULT_NUMBER_INPUT_STEP,
    }));

    const getIsWritable = () => !(access(props.isDisabled) ?? false) && !(access(props.isReadOnly) ?? false);

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

    let repeatDelay: ReturnType<typeof setTimeout> | undefined;
    let repeatInterval: ReturnType<typeof setInterval> | undefined;

    const stopStepping = () => {
        clearTimeout(repeatDelay);
        clearInterval(repeatInterval);

        repeatDelay = undefined;
        repeatInterval = undefined;
    };

    const startStepping = (direction: 1 | -1) => {
        stopStepping();
        stepValue(direction);

        repeatDelay = setTimeout(
            () => {
                repeatInterval = setInterval(
                    () => stepValue(direction),
                    access(props.repeatIntervalMs) ?? DEFAULT_NUMBER_INPUT_REPEAT_INTERVAL_MS,
                );
            },
            access(props.repeatDelayMs) ?? DEFAULT_NUMBER_INPUT_REPEAT_DELAY_MS,
        );
    };

    onCleanup(stopStepping);

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
        startSteppingUp: () => startStepping(1),
        startSteppingDown: () => startStepping(-1),
        stopStepping,
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
            element={"input"}
            type={"text"}
            inputMode={() => access(props.inputMode) ?? DEFAULT_NUMBER_INPUT_MODE}
            isSpinButton={true}
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
