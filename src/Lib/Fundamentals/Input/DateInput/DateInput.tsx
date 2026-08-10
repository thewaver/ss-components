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

    const getText = () => {
        const value = props.valueSignal[0]();

        return value ? TextSyncUtils.formatWithMask(getMask(), toDigits(value, getFormat())) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const refreshText = () => {
        textSignal[1](untrack(getText));
    };

    const parseText = (text: string) => parseDigits(TextSyncUtils.getMaskedDigits(text), untrack(getFormat));

    createEffect(() => {
        const digits = TextSyncUtils.getMaskedDigits(textSignal[0]());

        if (digits.length > 0 && digits.length < DIGIT_COUNT) return;

        const parsed = parseDigits(digits, getFormat());
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
            onBlur={refreshText}
        />
    );
};
