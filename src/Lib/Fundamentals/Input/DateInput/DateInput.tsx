import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { DateValue, DateValueCalendarId } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { MaskedField } from "../../../Abstracts/MaskedField/MaskedField";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
import { access } from "../../../Utils/propUtils";
import { TextField } from "../TextField/TextField";
import type { DateInputEra, DateInputFormat, DateInputProps } from "./DateInput.types";

const DEFAULT_DATE_INPUT_FORMAT: DateInputFormat = "iso";
const DEFAULT_DATE_INPUT_CALENDAR: DateValueCalendarId = "gregory";

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

const PART_HINTS: Record<DateInputPart, string> = {
    year: "yyyy",
    month: "mm",
    day: "dd",
};

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

const computeBounds = (anchor: DateValue) => {
    const monthCount = DateValueUtils.getMonthsInYear(anchor);
    const dayCeiling = Array.from({ length: monthCount }, (_, month) =>
        DateValueUtils.getDaysInMonth(anchor.set({ month: month + 1, day: 1 })),
    ).reduce((longest, days) => Math.max(longest, days), 1);

    return {
        year: { min: 1, max: DateValueUtils.getYearsInEra(anchor) },
        month: { min: 1, max: monthCount },
        day: { min: 1, max: dayCeiling },
    } satisfies Record<DateInputPart, { min: number; max: number }>;
};

const getHasImpossiblePart = (digits: string, format: DateInputFormat, anchor: DateValue) => {
    const { parts } = FORMATS[format];
    const bounds = computeBounds(anchor);

    return TextSyncUtils.readGroups(
        digits,
        parts.map((part) => PART_LENGTHS[part]),
    ).some((value, index) => value < bounds[parts[index]].min || value > bounds[parts[index]].max);
};

const readParts = (digits: string, format: DateInputFormat) => {
    const values: Partial<Record<DateInputPart, number>> = {};

    let offset = 0;

    for (const part of FORMATS[format].parts) {
        values[part] = Number(digits.slice(offset, offset + PART_LENGTHS[part]));
        offset += PART_LENGTHS[part];
    }

    return values;
};

const toDigits = (value: DateValue, format: DateInputFormat) =>
    FORMATS[format].parts.map((part) => `${value[part]}`.padStart(PART_LENGTHS[part], "0")).join("");

export const DateInput = (props: DateInputProps) => {
    const getFormat = createMemo(() => access(props.format) ?? DEFAULT_DATE_INPUT_FORMAT);

    const getCalendar = createMemo(() => access(props.calendar) ?? DEFAULT_DATE_INPUT_CALENDAR);

    const getMask = createMemo(() => computeMask(getFormat()));

    const getFieldValue = () => {
        const value = props.valueSignal[0]();

        return value ? DateValueUtils.withCalendar(value, getCalendar()) : undefined;
    };

    const getAnchor = createMemo(
        () => getFieldValue() ?? DateValueUtils.fromDate(new Date(), getCalendar()),
        undefined,
        { equals: (a, b) => a.era === b.era && a.year === b.year && a.calendar.identifier === b.calendar.identifier },
    );

    const getEraOptions = createMemo(() => DateValueUtils.getEras(getAnchor(), access(props.locale)));

    const [getEra, setEra] = createSignal<string>(
        untrack(() => {
            const value = getFieldValue();
            const options = untrack(getEraOptions);

            return value ? value.era : options[options.length - 1].id;
        }),
    );

    const fromDigits = (digits: string) => {
        if (digits.length !== DIGIT_COUNT) return undefined;

        const parts = readParts(digits, untrack(getFormat));
        const parsed = DateValueUtils.fromParts({
            calendar: untrack(getCalendar),
            era: untrack(getFieldValue)?.era ?? untrack(getEra),
            year: parts.year!,
            month: parts.month!,
            day: parts.day!,
        });

        return parsed && DateValueUtils.getIsInRange(parsed, access(props.minDate), access(props.maxDate))
            ? parsed
            : undefined;
    };

    const field = MaskedField.createField<DateValue>({
        getValue: getFieldValue,
        setValue: (next) => props.valueSignal[1](() => next),
        formatDigits: (digits) => TextSyncUtils.formatWithMask(getMask(), digits),
        getDigitCount: () => DIGIT_COUNT,
        toDigits: (value) => toDigits(value, getFormat()),
        fromDigits,
        getHasImpossibleDigits: (digits) => getHasImpossiblePart(digits, getFormat(), getAnchor()),
        getIsSame: DateValueUtils.isSame,
    });

    createEffect(() => {
        const value = getFieldValue();

        if (value) setEra(value.era);
    });

    const era: DateInputEra = {
        getValue: getEra,
        getOptions: getEraOptions,
        set: (next) => {
            setEra(next);

            const value = untrack(getFieldValue);

            if (!value) return;

            field.commit(
                DateValueUtils.clamp(DateValueUtils.withEra(value, next), access(props.minDate), access(props.maxDate)),
            );
        },
    };

    return (
        <TextField
            {...props}
            valueSignal={field.textSignal}
            element={"input"}
            inputMode={"numeric"}
            computeMaskedText={(previous, next, caret) => TextSyncUtils.applyMask(getMask(), previous, next, caret)}
            placeholderHint={() => computeHint(getFormat())}
            hasError={() => (access(props.hasError) ?? false) || field.getHasIssue()}
            renderLeading={props.renderLeading && ((getFlags) => props.renderLeading!(getFlags, era))}
            onInput={field.onInput}
            onBlur={field.onBlur}
        />
    );
};
