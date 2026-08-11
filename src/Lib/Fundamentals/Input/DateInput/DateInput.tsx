import { createEffect, createMemo, createSignal, untrack } from "solid-js";

import type { DateValue, DateValueCalendarId } from "../../../Abstracts/DateValue/DateValue.types";
import { DateValueUtils } from "../../../Abstracts/DateValue/DateValue.utils";
import { TextSyncUtils } from "../../../Abstracts/TextSync/TextSync.utils";
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

/**
 * What a part can hold whatever the other two turn out to be, which is what lets a finished part be refused
 * before the rest of the date exists. Every ceiling is asked of the calendar rather than assumed: a Coptic
 * year has thirteen months, and the day's ceiling is the longest month of the year in question — a shorter
 * month is a disagreement between parts and stays `fromParts`' to catch once all three are known.
 */
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
    const getFormat = createMemo(() => props.getFormat?.() ?? DEFAULT_DATE_INPUT_FORMAT);

    const getCalendar = createMemo(() => props.getCalendar?.() ?? DEFAULT_DATE_INPUT_CALENDAR);

    const getMask = createMemo(() => computeMask(getFormat()));

    const [getHasLeft, setHasLeft] = createSignal(false);

    /**
     * The field types in one calendar, and a value handed to it in another is converted rather than refused —
     * so a consumer may hold Gregorian and show a Hebrew field over it. The anchor is what every bound and
     * every era list is asked of; with no value there is nothing to read them off, so today stands in.
     */
    const getFieldValue = () => {
        const value = props.valueSignal[0]();

        return value ? DateValueUtils.withCalendar(value, getCalendar()) : undefined;
    };

    const getAnchor = createMemo(
        () => getFieldValue() ?? DateValueUtils.fromDate(new Date(), getCalendar()),
        undefined,
        { equals: (a, b) => a.era === b.era && a.year === b.year && a.calendar.identifier === b.calendar.identifier },
    );

    const getEraOptions = createMemo(() => DateValueUtils.getEras(getAnchor(), props.getLocale?.()));

    /**
     * The era is state rather than a reading of the value, and only because of the empty field: with no value
     * there is no year to read it off, and a consumer who picks an era before typing anything has to have that
     * remembered. Whenever a value does exist it wins — the effect below pushes it back — so the two can never
     * disagree about a date that is actually held. The default is the calendar's own last era, which is the
     * current one in every system that has more than one.
     */
    const [getEra, setEra] = createSignal<string>(
        untrack(() => {
            const value = getFieldValue();
            const options = untrack(getEraOptions);

            return value ? value.era : options[options.length - 1].id;
        }),
    );

    const getText = () => {
        const value = getFieldValue();

        return value ? TextSyncUtils.formatWithMask(getMask(), toDigits(value, getFormat())) : "";
    };

    const textSignal = createSignal(untrack(getText));

    const getDigits = () => TextSyncUtils.getMaskedDigits(textSignal[0]());

    const parseDigits = (digits: string) => {
        if (digits.length !== DIGIT_COUNT) return undefined;

        const parts = readParts(digits, untrack(getFormat));

        return DateValueUtils.fromParts({
            calendar: untrack(getCalendar),
            era: untrack(getEra),
            year: parts.year!,
            month: parts.month!,
            day: parts.day!,
        });
    };

    const getAcceptedValue = (digits: string) => {
        const parsed = parseDigits(digits);

        return parsed && DateValueUtils.getIsInRange(parsed, props.getMinDate?.(), props.getMaxDate?.())
            ? parsed
            : undefined;
    };

    /**
     * A date is refused for three reasons and the field says so at three different moments. A part that
     * cannot exist whatever follows it — a 13th month in a calendar that has twelve — is wrong as soon as that
     * part is complete, without waiting for the rest. A date whose parts each look possible but disagree, or
     * that falls outside the bounds, is only knowable once all the digits are in. And a date that is merely
     * unfinished is not wrong yet: saying so mid-keystroke would be noise, so it waits until the field is left.
     */
    const getHasIssue = createMemo(() => {
        const digits = getDigits();

        if (digits.length === 0) return false;
        if (getHasImpossiblePart(digits, getFormat(), getAnchor())) return true;
        if (digits.length < DIGIT_COUNT) return getHasLeft();

        return getAcceptedValue(digits) === undefined;
    });

    /**
     * Rewriting the text from the value is what puts a typed date into its canonical spelling, and it must
     * not run when there is no value to rewrite from — that would answer "this is not a date" by deleting
     * what was typed, which is the one response that leaves the reader with nothing to correct.
     */
    const refreshText = () => {
        if (untrack(getFieldValue) === undefined && untrack(getDigits).length > 0) return;

        textSignal[1](untrack(getText));
    };

    const commit = (next: DateValue | undefined) => {
        if (DateValueUtils.isSame(next, untrack(getFieldValue))) return;

        props.valueSignal[1](() => next);
    };

    createEffect(() => {
        const digits = getDigits();

        if (digits.length > 0 && digits.length < DIGIT_COUNT) return;

        commit(getAcceptedValue(digits));
    });

    createEffect(() => {
        const value = getFieldValue();

        if (value) setEra(value.era);

        if (DateValueUtils.isSame(value, parseDigits(untrack(getDigits)))) return;

        refreshText();
    });

    const era: DateInputEra = {
        getValue: getEra,
        getOptions: getEraOptions,
        set: (next) => {
            setEra(next);

            const value = untrack(getFieldValue);

            if (!value) return;

            commit(
                DateValueUtils.clamp(DateValueUtils.withEra(value, next), props.getMinDate?.(), props.getMaxDate?.()),
            );
        },
    };

    return (
        <TextField
            {...props}
            valueSignal={textSignal}
            getElement={() => "input"}
            getInputMode={() => "numeric"}
            getMask={getMask}
            getPlaceholderHint={() => computeHint(getFormat())}
            getHasError={() => (props.getHasError?.() ?? false) || getHasIssue()}
            renderLeading={props.renderLeading && ((getFlags) => props.renderLeading!(getFlags, era))}
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
