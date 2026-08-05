import { createContext, useContext } from "solid-js";

import type { RadioGroupContextType } from "./RadioGroup.context.types";

const RadioGroupContext = createContext<RadioGroupContextType>();

export const RadioGroupContextProvider = RadioGroupContext.Provider;

const ORPHAN_RADIO_CONTEXT: RadioGroupContextType = {
    getName: () => "",
    getValue: () => undefined,
    setValue: () => undefined,
    computeIsTabbable: () => true,
    register: () => undefined,
};

export const useRadioGroupContext = (): RadioGroupContextType => {
    const context = useContext(RadioGroupContext);

    if (!context) {
        console.warn(
            "Radio: no RadioGroup ancestor found — the radio cannot read or write a selection, and mutual exclusion, arrow-key navigation and the group's single tab stop are all inert.",
        );
    }

    return context ?? ORPHAN_RADIO_CONTEXT;
};
