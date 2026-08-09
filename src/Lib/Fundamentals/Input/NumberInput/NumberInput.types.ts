import type { JSX, Signal } from "solid-js";

import type { InteractionFlags } from "../../../Abstracts/Interaction/Interaction.types";
import type { TextFieldFlags, TextFieldPresetProps } from "../TextField/TextField.types";

export type NumberInputRangeDefs = {
    min?: number;
    max?: number;
};

export type NumberInputStepDefs = NumberInputRangeDefs & {
    step: number;
};

export type NumberInputStepper = {
    getIsAtMin: () => boolean;
    getIsAtMax: () => boolean;
    stepUp: () => void;
    stepDown: () => void;
};

export type NumberInputProps = Omit<
    TextFieldPresetProps,
    "getType" | "getAutoComplete" | "valueSignal" | "renderTrailing" | "onInput"
> & {
    valueSignal: Signal<number | undefined>;
    renderTrailing?: (getFlags: () => InteractionFlags<TextFieldFlags>, stepper: NumberInputStepper) => JSX.Element;
    onInput?: (value: number | undefined) => void | Promise<void>;
};
