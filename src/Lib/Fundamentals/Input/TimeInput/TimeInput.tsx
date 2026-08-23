import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import { TimeUtils } from "@thewaver/ss-utils";
import type { TimeValue, TimeValueMeridiem, TimeValueUnit } from "@thewaver/ss-utils";

import { MaskedField } from "../../../Abstracts/MaskedField/MaskedField";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import { access } from "../../../Utils/propUtils";
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
    const getIsTwelveHour = () => access(props.isTwelveHour) ?? false;

    const [getMeridiem, setMeridiem] = createSignal<TimeValueMeridiem>(
        untrack(() => {
            const value = props.valueSignal[0]();

            return value ? TimeUtils.getMeridiem(value) : DEFAULT_MERIDIEM;
        }),
    );

    const toText = (value: TimeValue) =>
        getIsTwelveHour() ? TimeUtils.toTwelveHourText(value) : TimeUtils.toIso(value);

    const parseText = (text: string) =>
        getIsTwelveHour() ? TimeUtils.fromTwelveHourText(text, untrack(getMeridiem)) : TimeUtils.fromIso(text);

    const getSegmentCount = () => (access(props.hasSeconds) ? SEGMENT_UNITS.length : SEGMENT_UNITS.length - 1);

    const getMask = createMemo(() => computeMask(getSegmentCount()));

    const fromDigits = (digits: string) => {
        if (digits.length !== getSegmentCount() * SEGMENT_LENGTH) return undefined;

        const parsed = parseText(TextSyncUtils.formatWithMask(untrack(getMask), digits));

        return parsed && TimeUtils.getIsInRange(parsed, access(props.minTime), access(props.maxTime))
            ? parsed
            : undefined;
    };

    const field = MaskedField.createField<TimeValue>({
        getValue: () => props.valueSignal[0](),
        setValue: (next) => props.valueSignal[1](() => next),
        formatDigits: (digits) => TextSyncUtils.formatWithMask(getMask(), digits),
        getDigitCount: () => getSegmentCount() * SEGMENT_LENGTH,
        toDigits: (value) => TextSyncUtils.getMaskedDigits(toText(value)),
        fromDigits,
        getHasImpossibleDigits: (digits) => getHasImpossibleSegment(digits, getSegmentCount(), getIsTwelveHour()),
        getIsSame: TimeUtils.isSame,
    });

    createEffect(() => {
        const value = props.valueSignal[0]();

        if (value) setMeridiem(TimeUtils.getMeridiem(value));
    });

    const meridiem: TimeInputMeridiem = {
        getValue: getMeridiem,
        set: (next) => {
            setMeridiem(next);

            const value = untrack(() => props.valueSignal[0]());

            if (!value) return;

            field.commit(
                TimeUtils.clamp(TimeUtils.withMeridiem(value, next), access(props.minTime), access(props.maxTime)),
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
        const stepped = TimeUtils.clamp(
            TimeUtils.addUnit(value, segment.unit, delta),
            access(props.minTime),
            access(props.maxTime),
        );

        e.preventDefault();

        props.valueSignal[1](() => stepped);
        field.textSignal[1](field.formatValue(stepped));
        element.setSelectionRange(segment.start, segment.start + SEGMENT_LENGTH);
    };

    return (
        <TextField
            {...props}
            valueSignal={field.textSignal}
            element={"input"}
            inputMode={"numeric"}
            computeMaskedText={(previous, next, caret) => TextSyncUtils.applyMask(getMask(), previous, next, caret)}
            placeholderHint={() => computeHint(getSegmentCount())}
            hasError={() => (access(props.hasError) ?? false) || field.getHasIssue()}
            renderTrailing={props.renderTrailing && ((getFlags) => props.renderTrailing!(getFlags, meridiem))}
            onInput={field.onInput}
            onKeyDown={handleKeyDown}
            onBlur={field.onBlur}
        />
    );
};
