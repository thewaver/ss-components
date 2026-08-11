import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { DateValue } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import { TextField } from "../TextField/TextField";
import type { DateInputFormat, DateInputProps } from "./DateInput.types";

const DEFAULT_DATE_INPUT_FORMAT: DateInputFormat = "iso";

const YEAR_LENGTH = 4;
const MONTH_LENGTH = 2;
const DAY_LENGTH = 2;
const DIGIT_COUNT = YEAR_LENGTH + MONTH_LENGTH + DAY_LENGTH;

type DateInputPart = "year" | "month" | "day";

const PART_LENGTHS: Record<DateInputPart, number> = {
    year: YEAR_LENGTH,
    month: MONTH_LENGTH,
    day: DAY_LENGTH,
};

/**
 * What a part can hold whatever the other two turn out to be, which is what lets a finished part be refused
 * before the rest of the date exists. The day's ceiling is the longest month; a 30th of February is a
 * disagreement between parts and stays `fromIso`'s to catch once all three are known.
 */
const PART_BOUNDS: Record<DateInputPart, { min: number; max: number }> = {
    year: { min: 0, max: 9999 },
    month: { min: 1, max: 12 },
    day: { min: 1, max: 31 },
};

const PART_HINTS: Record<DateInputPart, string> = {
    year: "yyyy",
    month: "mm",
    day: "dd",
};

/**
 * A format states the order of the parts and the separator, and the mask is derived from both rather than
 * given alongside them. A consumer handed an arbitrary mask string would leave the component guessing which
 * of its slots were the month, and a spelling the parse does not agree with is a field that silently reads a
 * date wrong — so the order is the prop and the pattern is a consequence of it.
 */
const FORMATS: Record<DateInputFormat, { parts: DateInputPart[]; separator: string }> = {
    "iso": { parts: ["year", "month", "day"], separator: "-" },
    "day-month-year": { parts: ["day", "month", "year"], separator: "/" },
    "month-day-year": { parts: ["month", "day", "year"], separator: "/" },
};

const computeMask = (format: DateInputFormat) => {
    const { parts, separator } = FORMATS[format];

    return parts.map((part) => TextSyncUtils.MASK_DIGIT.repeat(PART_LENGTHS[part])).join(separator);
};

const computeHint = (format: DateInputFormat) => {
    const { parts, separator } = FORMATS[format];

    return parts.map((part) => PART_HINTS[part]).join(separator);
};

const getHasImpossiblePart = (digits: string, format: DateInputFormat) => {
    const { parts } = FORMATS[format];

    return TextSyncUtils.readGroups(
        digits,
        parts.map((part) => PART_LENGTHS[part]),
    ).some((value, index) => value < PART_BOUNDS[parts[index]].min || value > PART_BOUNDS[parts[index]].max);
};

/**
 * The display order is reassembled into ISO and handed to `fromIso`, which stays the only thing that decides
 * whether a typed date exists — so the 31st of February is refused in every order rather than once per order.
 */
const parseDigits = (digits: string, format: DateInputFormat) => {
    if (digits.length !== DIGIT_COUNT) return undefined;

    const values: Partial<Record<DateInputPart, string>> = {};

    let offset = 0;

    for (const part of FORMATS[format].parts) {
        values[part] = digits.slice(offset, offset + PART_LENGTHS[part]);
        offset += PART_LENGTHS[part];
    }

    return DateValueUtils.fromIso(`${values.year}-${values.month}-${values.day}`);
};

const toDigits = (value: DateValue, format: DateInputFormat) =>
    FORMATS[format].parts.map((part) => `${value[part]}`.padStart(PART_LENGTHS[part], "0")).join("");

export const DateInput = (props: DateInputProps) => {
    const getFormat = createMemo(() => props.getFormat?.() ?? DEFAULT_DATE_INPUT_FORMAT);

    const getMask = createMemo(() => computeMask(getFormat()));

    const [getHasLeft, setHasLeft] = createSignal(false);

    const getText = () => {
        const value = props.valueSignal[0]();

        return value ? TextSyncUtils.formatWithMask(getMask(), toDigits(value, getFormat())) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const getDigits = () => TextSyncUtils.getMaskedDigits(textSignal[0]());

    const getAcceptedValue = (digits: string) => {
        const parsed = parseDigits(digits, getFormat());

        return parsed && DateValueUtils.getIsInRange(parsed, props.getMinDate?.(), props.getMaxDate?.())
            ? parsed
            : undefined;
    };

    /**
     * A date is refused for three reasons and the field says so at three different moments. A part that
     * cannot exist whatever follows it — a 13th month — is wrong as soon as that part is complete, without
     * waiting for the rest. A date whose parts each look possible but disagree, or that falls outside the
     * bounds, is only knowable once all the digits are in. And a date that is merely unfinished is not wrong
     * yet: saying so mid-keystroke would be noise, so it waits until the field is left.
     */
    const getHasIssue = createMemo(() => {
        const digits = getDigits();

        if (digits.length === 0) return false;
        if (getHasImpossiblePart(digits, getFormat())) return true;
        if (digits.length < DIGIT_COUNT) return getHasLeft();

        return getAcceptedValue(digits) === undefined;
    });

    /**
     * Rewriting the text from the value is what puts a typed date into its canonical spelling, and it must
     * not run when there is no value to rewrite from — that would answer "this is not a date" by deleting
     * what was typed, which is the one response that leaves the reader with nothing to correct.
     */
    const refreshText = () => {
        if (untrack(() => props.valueSignal[0]()) === undefined && untrack(getDigits).length > 0) return;

        textSignal[1](untrack(getText));
    };

    const parseText = (text: string) => parseDigits(TextSyncUtils.getMaskedDigits(text), untrack(getFormat));

    createEffect(() => {
        const digits = getDigits();

        if (digits.length > 0 && digits.length < DIGIT_COUNT) return;

        const next = getAcceptedValue(digits);

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

        if (DateValueUtils.isSame(value, parseText(untrack(textSignal[0])))) return;

        refreshText();
    });

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getInputMode={() => "numeric"}
            getMask={getMask}
            getPlaceholderHint={() => computeHint(getFormat())}
            getHasError={() => (props.getHasError?.() ?? false) || getHasIssue()}
            onInput={() => {
                setHasLeft(false);
            }}
            onBlur={() => {
                setHasLeft(true);
                refreshText();
            }}
        />
    );
};
