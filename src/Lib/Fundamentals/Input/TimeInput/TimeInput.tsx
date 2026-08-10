import { createEffect, createSignal, untrack } from "solid-js";

import type { TimeValue, TimeValueMeridiem, TimeValueUnit } from "../../../Abstracts/TimeValue/TimeValue.types";
import { TimeValueUtils } from "../../../Abstracts/TimeValue/TimeValue.utils";
import { TextField } from "../TextField/TextField";
import type { TimeInputMeridiem, TimeInputProps } from "./TimeInput.types";

const SEGMENT_LENGTH = 2;
const SEPARATOR_LENGTH = 1;
const SEGMENT_STRIDE = SEGMENT_LENGTH + SEPARATOR_LENGTH;
const SEGMENT_UNITS: TimeValueUnit[] = ["hour", "minute", "second"];
const STEP_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };
const DEFAULT_MERIDIEM: TimeValueMeridiem = "am";

const getSegmentAt = (caret: number) => {
    const index = Math.min(Math.floor(caret / SEGMENT_STRIDE), SEGMENT_UNITS.length - 1);

    return { unit: SEGMENT_UNITS[index], start: index * SEGMENT_STRIDE };
};

export const TimeInput = (props: TimeInputProps) => {
    const getIsTwelveHour = () => props.getIsTwelveHour?.() ?? false;

    /**
     * The meridiem is state rather than a reading of the value, and only because of the empty field: with no
     * value there is no hour to read it off, and a consumer who picks "pm" before typing anything has to have
     * that remembered. Whenever a value does exist it wins — the effect below pushes it back — so the two can
     * never disagree about a time that is actually held.
     */
    const [getMeridiem, setMeridiem] = createSignal<TimeValueMeridiem>(
        untrack(() => {
            const value = props.valueSignal[0]();

            return value ? TimeValueUtils.getMeridiem(value) : DEFAULT_MERIDIEM;
        }),
    );

    const toText = (value: TimeValue) =>
        getIsTwelveHour() ? TimeValueUtils.toTwelveHourText(value) : TimeValueUtils.toIso(value);

    const parseText = (text: string) =>
        getIsTwelveHour()
            ? TimeValueUtils.fromTwelveHourText(text, untrack(getMeridiem))
            : TimeValueUtils.fromIso(text);

    const getText = () => {
        const value = props.valueSignal[0]();

        return value ? toText(value) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const refreshText = () => {
        textSignal[1](untrack(getText));
    };

    const getExpectedLength = () =>
        (props.getHasSeconds?.() ? SEGMENT_UNITS.length : SEGMENT_UNITS.length - 1) * SEGMENT_STRIDE - SEPARATOR_LENGTH;

    const commit = (next: TimeValue | undefined) => {
        if (
            TimeValueUtils.isSame(
                next,
                untrack(() => props.valueSignal[0]()),
            )
        )
            return;

        props.valueSignal[1](() => next);
    };

    createEffect(() => {
        const text = textSignal[0]();

        if (text.length > 0 && text.length < getExpectedLength()) return;

        const parsed = parseText(text);

        commit(
            parsed && TimeValueUtils.getIsInRange(parsed, props.getMinTime?.(), props.getMaxTime?.())
                ? parsed
                : undefined,
        );
    });

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (value) setMeridiem(TimeValueUtils.getMeridiem(value));

        if (TimeValueUtils.isSame(value, parseText(untrack(textSignal[0])))) return;

        refreshText();
    });

    const meridiem: TimeInputMeridiem = {
        getValue: getMeridiem,
        set: (next) => {
            setMeridiem(next);

            const value = untrack(() => props.valueSignal[0]());

            if (!value) return;

            commit(
                TimeValueUtils.clamp(
                    TimeValueUtils.withMeridiem(value, next),
                    props.getMinTime?.(),
                    props.getMaxTime?.(),
                ),
            );
        },
        toggle: () => {
            meridiem.set(getMeridiem() === "am" ? "pm" : "am");
        },
    };

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
        textSignal[1](toText(stepped));
        element.setSelectionRange(segment.start, segment.start + SEGMENT_LENGTH);
    };

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getInputMode={() => "numeric"}
            renderTrailing={props.renderTrailing && ((getFlags) => props.renderTrailing!(getFlags, meridiem))}
            onKeyDown={handleKeyDown}
            onBlur={refreshText}
        />
    );
};
