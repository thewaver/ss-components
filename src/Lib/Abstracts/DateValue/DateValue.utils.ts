import {
    CalendarDate,
    createCalendar,
    getLocalTimeZone,
    isSameDay,
    startOfMonth,
    toCalendar,
    toCalendarDate,
    fromDate as toDateValue,
} from "@internationalized/date";

import type {
    DateValue,
    DateValueCalendarId,
    DateValueEra,
    DateValueMonthGrid,
    DateValueParts,
    DateValueRange,
    DateValueWeekStart,
    DateValueWeekdayWidth,
} from "./DateValue.types";

const DAYS_PER_WEEK = 7;
const GRID_WEEKS = 6;
const MIDDAY_MS = 12 * 60 * 60 * 1000;
const DEFAULT_CALENDAR_ID: DateValueCalendarId = "gregory";
const ISO_PATTERN = /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})$/;

const CALENDAR_IDS: DateValueCalendarId[] = [
    "gregory",
    "buddhist",
    "coptic",
    "ethiopic",
    "ethioaa",
    "hebrew",
    "indian",
    "islamic-civil",
    "islamic-tbla",
    "islamic-umalqura",
    "japanese",
    "persian",
    "roc",
];

const eraCache = new Map<string, DateValueEra[]>();
const monthNameCache = new Map<string, string[]>();

const getCalendarOf = (id: DateValueCalendarId) => createCalendar(id);

const toIntlDate = (value: DateValue) => new Date(value.toDate(getLocalTimeZone()).getTime() + MIDDAY_MS);

const fromAstronomicalYear = (year: number, month: number, day: number) =>
    year > 0 ? new CalendarDate(year, month, day) : new CalendarDate("BC", 1 - year, month, day);

const getEraStart = (id: DateValueCalendarId, era: string) => new CalendarDate(getCalendarOf(id), era, 1, 1, 1);

const getEraSample = (id: DateValueCalendarId, era: string) => getEraStart(id, era).set({ year: 2 });

export namespace DateValueUtils {
    export const getCalendarIds = () => [...CALENDAR_IDS];

    export const getCalendarId = (value: DateValue) => value.calendar.identifier as DateValueCalendarId;

    export const withCalendar = (value: DateValue, id: DateValueCalendarId) =>
        toCalendar(value, getCalendarOf(id)) as DateValue;

    export const isSame = (a: DateValue | undefined, b: DateValue | undefined) =>
        a === undefined || b === undefined ? a === b : isSameDay(a, b);

    export const compare = (a: DateValue, b: DateValue) => a.compare(b);

    export const fromDate = (date: Date, id: DateValueCalendarId = DEFAULT_CALENDAR_ID) =>
        withCalendar(toCalendarDate(toDateValue(date, getLocalTimeZone())), id);

    export const toDate = (value: DateValue) => value.toDate(getLocalTimeZone());

    export const getEras = (value: DateValue, locale?: string): DateValueEra[] => {
        const id = getCalendarId(value);
        const key = `${id}:${locale ?? ""}`;
        const cached = eraCache.get(key);

        if (cached) return cached;

        const ids = getCalendarOf(id).getEras();
        const readEra = (width: "long" | "short", at: Date) =>
            new Intl.DateTimeFormat(locale, {
                era: width,
                year: "numeric",
                calendar: id,
                timeZone: getLocalTimeZone(),
            })
                .formatToParts(at)
                .find((part) => part.type === "era")?.value;

        const eras = ids.map((eraId) => {
            const at = toIntlDate(getEraSample(id, eraId));

            return {
                id: eraId,
                name: readEra("long", at) ?? eraId,
                shortName: readEra("short", at) ?? eraId,
            };
        });

        eraCache.set(key, eras);

        return eras;
    };

    export const withEra = (value: DateValue, era: string) =>
        getEraStart(getCalendarId(value), era).set({
            year: value.year,
            month: value.month,
            day: value.day,
        }) as DateValue;

    export const getMonthsInYear = (value: DateValue) => value.calendar.getMonthsInYear(value);

    export const getYearsInEra = (value: DateValue) => value.calendar.getYearsInEra?.(value) ?? Infinity;

    export const getDaysInMonth = (value: DateValue) => value.calendar.getDaysInMonth(value);

    export const getStartOfMonth = (value: DateValue) => startOfMonth(value) as DateValue;

    export const addDays = (value: DateValue, days: number) => value.add({ days }) as DateValue;

    export const addMonths = (value: DateValue, months: number) => value.add({ months }) as DateValue;

    export const addYears = (value: DateValue, years: number) => value.add({ years }) as DateValue;

    export const clamp = (value: DateValue, min?: DateValue, max?: DateValue) => {
        if (min && compare(value, min) < 0) return min;
        if (max && compare(value, max) > 0) return max;

        return value;
    };

    export const orderRange = (a: DateValue, b: DateValue): DateValueRange =>
        compare(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };

    export const isSameRange = (a: DateValueRange | undefined, b: DateValueRange | undefined) =>
        a === b || (a !== undefined && b !== undefined && isSame(a.start, b.start) && isSame(a.end, b.end));

    export const getIsWithin = (value: DateValue, range: DateValueRange | undefined) =>
        range !== undefined && compare(value, range.start) >= 0 && compare(value, range.end) <= 0;

    export const getIsInRange = (value: DateValue, min?: DateValue, max?: DateValue) =>
        (!min || compare(value, min) >= 0) && (!max || compare(value, max) <= 0);

    export const getWeekdayOffset = (value: DateValue, weekStartsOn: DateValueWeekStart) =>
        (toIntlDate(value).getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;

    export const getMonthGrid = (value: DateValue, weekStartsOn: DateValueWeekStart): DateValueMonthGrid => {
        const anchor = getStartOfMonth(value);
        const start = addDays(anchor, -getWeekdayOffset(anchor, weekStartsOn));

        return {
            anchor,
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

    export const toParts = (value: DateValue): DateValueParts => ({
        calendar: getCalendarId(value),
        era: value.era,
        year: value.year,
        month: value.month,
        day: value.day,
    });

    export const fromParts = (parts: DateValueParts): DateValue | undefined => {
        const calendar = getCalendarOf(parts.calendar);

        if (!calendar.getEras().includes(parts.era)) return undefined;

        const built = new CalendarDate(calendar, parts.era, parts.year, parts.month, parts.day);

        if (built.year !== parts.year || built.month !== parts.month || built.day !== parts.day) return undefined;

        return built;
    };

    export const toIso = (value: DateValue) => withCalendar(value, DEFAULT_CALENDAR_ID).toString();

    export const fromIso = (text: string, id: DateValueCalendarId = DEFAULT_CALENDAR_ID): DateValue | undefined => {
        const parts = ISO_PATTERN.exec(text);

        if (!parts) return undefined;

        const year = Number(parts[1]);
        const month = Number(parts[2]);
        const day = Number(parts[3]);

        if (parts[1].startsWith("-") && year === 0) return undefined;

        const built = fromAstronomicalYear(year, month, day);

        if (built.year !== (year > 0 ? year : 1 - year) || built.month !== month || built.day !== day) {
            return undefined;
        }

        return withCalendar(built, id);
    };

    export const getMonthNames = (value: DateValue, locale?: string) => {
        const id = getCalendarId(value);
        const key = `${id}:${locale ?? ""}:${value.era}:${value.year}`;
        const cached = monthNameCache.get(key);

        if (cached) return cached;

        const formatter = new Intl.DateTimeFormat(locale, {
            month: "long",
            calendar: id,
            timeZone: getLocalTimeZone(),
        });
        const anchor = getStartOfMonth(value);
        const names = Array.from({ length: getMonthsInYear(value) }, (_, month) =>
            formatter.format(toIntlDate(anchor.set({ month: month + 1, day: 1 }))),
        );

        monthNameCache.set(key, names);

        return names;
    };

    export const getWeekdayNames = (
        weekStartsOn: DateValueWeekStart,
        width: DateValueWeekdayWidth,
        locale?: string,
    ) => {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: width });

        return Array.from({ length: DAYS_PER_WEEK }, (_, index) =>
            formatter.format(new Date(2021, 7, 1 + ((index + weekStartsOn) % DAYS_PER_WEEK), 12)),
        );
    };

    export const format = (value: DateValue, options?: Intl.DateTimeFormatOptions, locale?: string) =>
        new Intl.DateTimeFormat(locale, {
            ...options,
            calendar: getCalendarId(value),
            timeZone: getLocalTimeZone(),
        }).format(toIntlDate(value));
}
