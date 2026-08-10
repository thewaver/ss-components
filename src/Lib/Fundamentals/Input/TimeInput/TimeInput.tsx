import { createEffect, createSignal, untrack } from "solid-js";

import type { TimeValueUnit } from "../../../Abstracts/TimeValue/TimeValue.types";
import { TimeValueUtils } from "../../../Abstracts/TimeValue/TimeValue.utils";
import { TextField } from "../TextField/TextField";
import type { TimeInputProps } from "./TimeInput.types";

const SEGMENT_LENGTH = 2;
const SEPARATOR_LENGTH = 1;
const SEGMENT_STRIDE = SEGMENT_LENGTH + SEPARATOR_LENGTH;
const SEGMENT_UNITS: TimeValueUnit[] = ["hour", "minute", "second"];
const STEP_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };

const getSegmentAt = (caret: number) => {
    const index = Math.min(Math.floor(caret / SEGMENT_STRIDE), SEGMENT_UNITS.length - 1);

    return { unit: SEGMENT_UNITS[index], start: index * SEGMENT_STRIDE };
};

export const TimeInput = (props: TimeInputProps) => {
    const getText = () => {
        const value = props.valueSignal[0]();

        return value ? TimeValueUtils.toIso(value) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const refreshText = () => {
        textSignal[1](untrack(getText));
    };

    const getExpectedLength = () =>
        (props.getHasSeconds?.() ? SEGMENT_UNITS.length : SEGMENT_UNITS.length - 1) * SEGMENT_STRIDE - SEPARATOR_LENGTH;

    createEffect(() => {
        const text = textSignal[0]();

        if (text.length > 0 && text.length < getExpectedLength()) return;

        const parsed = TimeValueUtils.fromIso(text);
        const next =
            parsed && TimeValueUtils.getIsInRange(parsed, props.getMinTime?.(), props.getMaxTime?.())
                ? parsed
                : undefined;

        if (
            TimeValueUtils.isSame(
                next,
                untrack(() => props.valueSignal[0]()),
            )
        )
            return;

        props.valueSignal[1](() => next);
    });

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (TimeValueUtils.isSame(value, TimeValueUtils.fromIso(untrack(textSignal[0])))) return;

        refreshText();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
        const delta = STEP_KEYS[e.key];
        const element = e.currentTarget as HTMLInputElement | null;
        const value = props.valueSignal[0]();

        if (delta === undefined || !element || !value) return;

        const segment = getSegmentAt(element.selectionStart ?? 0);
        const stepped = TimeValueUtils.clamp(
            TimeValueUtils.addUnit(value, segment.unit, delta),
            props.getMinTime?.(),
            props.getMaxTime?.(),
        );

        e.preventDefault();

        props.valueSignal[1](() => stepped);
        textSignal[1](TimeValueUtils.toIso(stepped));
        element.setSelectionRange(segment.start, segment.start + SEGMENT_LENGTH);
    };

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getInputMode={() => "numeric"}
            onKeyDown={handleKeyDown}
            onBlur={refreshText}
        />
    );
};
