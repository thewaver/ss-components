import { createEffect, createSignal, untrack } from "solid-js";

import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { TextField } from "../TextField/TextField";
import type { DateInputProps } from "./DateInput.types";

const ISO_LENGTH = 10;

export const DateInput = (props: DateInputProps) => {
    const getText = () => {
        const value = props.valueSignal[0]();

        return value ? DateValueUtils.toIso(value) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const refreshText = () => {
        textSignal[1](untrack(getText));
    };

    createEffect(() => {
        const text = textSignal[0]();

        if (text.length > 0 && text.length < ISO_LENGTH) return;

        const parsed = DateValueUtils.fromIso(text);
        const next =
            parsed && DateValueUtils.getIsInRange(parsed, props.getMinDate?.(), props.getMaxDate?.())
                ? parsed
                : undefined;

        if (
            DateValueUtils.isSame(
                next,
                untrack(() => props.valueSignal[0]()),
            )
        )
            return;

        props.valueSignal[1](() => next);
    });

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (DateValueUtils.isSame(value, DateValueUtils.fromIso(untrack(textSignal[0])))) return;

        refreshText();
    });

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getInputMode={() => "numeric"}
            onBlur={refreshText}
        />
    );
};
