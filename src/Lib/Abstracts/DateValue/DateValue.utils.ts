import type { DateValue, DateValueMonthGrid, DateValueWeekStart, DateValueWeekdayWidth } from "./DateValue.types";

const DAYS_PER_WEEK = 7;
const MONTHS_PER_YEAR = 12;
const GRID_WEEKS = 6;
const MIDDAY_HOUR = 12;
const ANCHOR_YEAR = 2000;
const ISO_PATTERN = /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})$/;
const ISO_PART_DIGITS = 2;
const ISO_YEAR_DIGITS = 4;
const ISO_EXPANDED_YEAR_DIGITS = 6;
const ISO_MIN_PLAIN_YEAR = 0;
const ISO_MAX_PLAIN_YEAR = 9999;

const buildLocalDate = (year: number, month: number, day: number) => {
    const date = new Date(ANCHOR_YEAR, 0, 1, MIDDAY_HOUR);

    date.setFullYear(year, month, day);

    return date;
};

const toLocalDate = (value: DateValue) => buildLocalDate(value.year, value.month - 1, value.day);

const toIsoYear = (year: number) => {
    if (year >= ISO_MIN_PLAIN_YEAR && year <= ISO_MAX_PLAIN_YEAR) {
        return `${year}`.padStart(ISO_YEAR_DIGITS, "0");
    }

    return `${year < 0 ? "-" : "+"}${`${Math.abs(year)}`.padStart(ISO_EXPANDED_YEAR_DIGITS, "0")}`;
};

export namespace DateValueUtils {
    export const isSame = (a: DateValue | undefined, b: DateValue | undefined) =>
        a?.year === b?.year && a?.month === b?.month && a?.day === b?.day;

    export const compare = (a: DateValue, b: DateValue) => a.year - b.year || a.month - b.month || a.day - b.day;

    export const fromDate = (date: Date): DateValue => ({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
    });

    export const toDate = (value: DateValue) => toLocalDate(value);

    export const getDaysInMonth = (year: number, month: number) => buildLocalDate(year, month, 0).getDate();

    export const addDays = (value: DateValue, days: number): DateValue => {
        const date = toLocalDate(value);

        date.setDate(date.getDate() + days);

        return fromDate(date);
    };

    export const addMonths = (value: DateValue, months: number): DateValue => {
        const flat = value.year * MONTHS_PER_YEAR + (value.month - 1) + months;
        const year = Math.floor(flat / MONTHS_PER_YEAR);
        const month = (((flat % MONTHS_PER_YEAR) + MONTHS_PER_YEAR) % MONTHS_PER_YEAR) + 1;

        return { year, month, day: Math.min(value.day, getDaysInMonth(year, month)) };
    };

    export const clamp = (value: DateValue, min?: DateValue, max?: DateValue) => {
        if (min && compare(value, min) < 0) return min;
        if (max && compare(value, max) > 0) return max;

        return value;
    };

    export const getIsInRange = (value: DateValue, min?: DateValue, max?: DateValue) =>
        (!min || compare(value, min) >= 0) && (!max || compare(value, max) <= 0);

    export const getWeekdayOffset = (value: DateValue, weekStartsOn: DateValueWeekStart) =>
        (toLocalDate(value).getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;

    export const getMonthGrid = (year: number, month: number, weekStartsOn: DateValueWeekStart): DateValueMonthGrid => {
        const first: DateValue = { year, month, day: 1 };
        const start = addDays(first, -getWeekdayOffset(first, weekStartsOn));

        return {
            year,
            month,
            weeks: Array.from({ length: GRID_WEEKS }, (_, week) =>
                Array.from({ length: DAYS_PER_WEEK }, (_, day) => addDays(start, week * DAYS_PER_WEEK + day)),
            ),
        };
    };

    export const getCellOf = (grid: DateValueMonthGrid, value: DateValue) => {
        for (let y = 0; y < grid.weeks.length; y += 1) {
            const x = grid.weeks[y].findIndex((day) => isSame(day, value));

            if (x >= 0) return { x, y };
        }

        return undefined;
    };

    export const toIso = (value: DateValue) =>
        `${toIsoYear(value.year)}-${`${value.month}`.padStart(ISO_PART_DIGITS, "0")}-${`${value.day}`.padStart(ISO_PART_DIGITS, "0")}`;

    export const fromIso = (text: string): DateValue | undefined => {
        const parts = ISO_PATTERN.exec(text);

        if (!parts) return;

        const year = Number(parts[1]);
        const month = Number(parts[2]);
        const day = Number(parts[3]);

        if (parts[1].startsWith("-") && year === 0) return;
        if (month < 1 || month > MONTHS_PER_YEAR) return;
        if (day < 1 || day > getDaysInMonth(year, month)) return;

        return { year, month, day };
    };

    export const getMonthNames = (locale?: string) => {
        const formatter = new Intl.DateTimeFormat(locale, { month: "long" });

        return Array.from({ length: MONTHS_PER_YEAR }, (_, month) =>
            formatter.format(new Date(2021, month, 1, MIDDAY_HOUR)),
        );
    };

    export const getWeekdayNames = (
        weekStartsOn: DateValueWeekStart,
        width: DateValueWeekdayWidth,
        locale?: string,
    ) => {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: width });

        return Array.from({ length: DAYS_PER_WEEK }, (_, index) =>
            formatter.format(new Date(2021, 7, 1 + ((index + weekStartsOn) % DAYS_PER_WEEK), MIDDAY_HOUR)),
        );
    };

    export const format = (value: DateValue, options?: Intl.DateTimeFormatOptions, locale?: string) =>
        new Intl.DateTimeFormat(locale, options).format(toLocalDate(value));
}
