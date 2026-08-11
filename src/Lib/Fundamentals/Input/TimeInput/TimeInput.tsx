import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import type { TimeValue, TimeValueMeridiem, TimeValueUnit } from "../../../Abstracts/TimeValue/TimeValue.types";
import { TimeValueUtils } from "../../../Abstracts/TimeValue/TimeValue.utils";
import { TextField } from "../TextField/TextField";
import type { TimeInputMeridiem, TimeInputProps } from "./TimeInput.types";

const SEGMENT_LENGTH = 2;
const SEPARATOR = ":";
const SEPARATOR_LENGTH = SEPARATOR.length;
const SEGMENT_STRIDE = SEGMENT_LENGTH + SEPARATOR_LENGTH;
const SEGMENT_UNITS: TimeValueUnit[] = ["hour", "minute", "second"];
const SEGMENT_HINTS: Record<TimeValueUnit, string> = { hour: "hh", minute: "mm", second: "ss" };
const STEP_KEYS: Record<string, number> = { ArrowUp: 1, ArrowDown: -1 };
const DEFAULT_MERIDIEM: TimeValueMeridiem = "am";

/** What a segment can hold whatever the others turn out to be. A 12-hour clock counts from one, not zero. */
const SEGMENT_BOUNDS: Record<TimeValueUnit, { min: number; max: number }> = {
    hour: { min: 0, max: 23 },
    minute: { min: 0, max: 59 },
    second: { min: 0, max: 59 },
};

const TWELVE_HOUR_BOUNDS = { min: 1, max: 12 };

const getSegmentAt = (caret: number) => {
    const index = Math.min(Math.floor(caret / SEGMENT_STRIDE), SEGMENT_UNITS.length - 1);

    return { unit: SEGMENT_UNITS[index], start: index * SEGMENT_STRIDE };
};

const computeMask = (segmentCount: number) =>
    Array.from({ length: segmentCount }, () => TextSyncUtils.MASK_DIGIT.repeat(SEGMENT_LENGTH)).join(SEPARATOR);

const computeHint = (segmentCount: number) =>
    SEGMENT_UNITS.slice(0, segmentCount)
        .map((unit) => SEGMENT_HINTS[unit])
        .join(SEPARATOR);

const getHasImpossibleSegment = (digits: string, segmentCount: number, isTwelveHour: boolean) => {
    const units = SEGMENT_UNITS.slice(0, segmentCount);

    return TextSyncUtils.readGroups(
        digits,
        units.map(() => SEGMENT_LENGTH),
    ).some((value, index) => {
        const bounds = units[index] === "hour" && isTwelveHour ? TWELVE_HOUR_BOUNDS : SEGMENT_BOUNDS[units[index]];

        return value < bounds.min || value > bounds.max;
    });
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

    const [getHasLeft, setHasLeft] = createSignal(false);

    const getSegmentCount = () => (props.getHasSeconds?.() ? SEGMENT_UNITS.length : SEGMENT_UNITS.length - 1);

    const getMask = createMemo(() => computeMask(getSegmentCount()));

    const getDigits = () => TextSyncUtils.getMaskedDigits(textSignal[0]());

    const getExpectedDigits = () => getSegmentCount() * SEGMENT_LENGTH;

    const getExpectedLength = () => getSegmentCount() * SEGMENT_STRIDE - SEPARATOR_LENGTH;

    const getAcceptedValue = (text: string) => {
        const parsed = parseText(text);

        return parsed && TimeValueUtils.getIsInRange(parsed, props.getMinTime?.(), props.getMaxTime?.())
            ? parsed
            : undefined;
    };

    /**
     * The same three moments `DateInput` reports at, for the same reasons: a 25th hour is wrong as soon as
     * that segment is complete, a time outside the bounds needs all of them, and a half-typed time waits
     * until the field is left.
     */
    const getHasIssue = createMemo(() => {
        const digits = getDigits();

        if (digits.length === 0) return false;
        if (getHasImpossibleSegment(digits, getSegmentCount(), getIsTwelveHour())) return true;
        if (digits.length < getExpectedDigits()) return getHasLeft();

        return getAcceptedValue(textSignal[0]()) === undefined;
    });

    const refreshText = () => {
        if (untrack(() => props.valueSignal[0]()) === undefined && untrack(getDigits).length > 0) return;

        textSignal[1](untrack(getText));
    };

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

        commit(getAcceptedValue(text));
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
            getMask={getMask}
            getPlaceholderHint={() => computeHint(getSegmentCount())}
            getHasError={() => (props.getHasError?.() ?? false) || getHasIssue()}
            renderTrailing={props.renderTrailing && ((getFlags) => props.renderTrailing!(getFlags, meridiem))}
            onInput={() => {
                setHasLeft(false);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
                setHasLeft(true);
                refreshText();
            }}
        />
    );
};
