import type { TimeValue, TimeValueMeridiem, TimeValueUnit } from "./TimeValue.types";

const HOURS_PER_DAY = 24;
const HOURS_PER_HALF_DAY = 12;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = MINUTES_PER_HOUR * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = HOURS_PER_DAY * SECONDS_PER_HOUR;
const SHORT_LENGTH = 5;
const LONG_LENGTH = 8;
const ISO_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;
const ANCHOR_YEAR = 2021;
const PAD = 2;

const wrap = (seconds: number) => ((seconds % SECONDS_PER_DAY) + SECONDS_PER_DAY) % SECONDS_PER_DAY;

const pad = (value: number) => `${value}`.padStart(PAD, "0");

export namespace TimeValueUtils {
    export const getSecondOfDay = (value: TimeValue) =>
        value.hour * SECONDS_PER_HOUR + value.minute * SECONDS_PER_MINUTE + (value.second ?? 0);

    export const fromSecondOfDay = (seconds: number, hasSeconds?: boolean): TimeValue => {
        const wrapped = wrap(Math.round(seconds));
        const second = wrapped % SECONDS_PER_MINUTE;

        return {
            hour: Math.floor(wrapped / SECONDS_PER_HOUR),
            minute: Math.floor((wrapped % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
            ...((hasSeconds ?? second !== 0) ? { second } : {}),
        };
    };

    export const isSame = (a: TimeValue | undefined, b: TimeValue | undefined) =>
        a === b || (!!a && !!b && getSecondOfDay(a) === getSecondOfDay(b));

    export const compare = (a: TimeValue, b: TimeValue) => getSecondOfDay(a) - getSecondOfDay(b);

    export const clamp = (value: TimeValue, min?: TimeValue, max?: TimeValue) => {
        if (min && compare(value, min) < 0) return min;
        if (max && compare(value, max) > 0) return max;

        return value;
    };

    export const getIsInRange = (value: TimeValue, min?: TimeValue, max?: TimeValue) =>
        (!min || compare(value, min) >= 0) && (!max || compare(value, max) <= 0);

    export const addUnit = (value: TimeValue, unit: TimeValueUnit, delta: number): TimeValue => {
        const step = unit === "hour" ? SECONDS_PER_HOUR : unit === "minute" ? SECONDS_PER_MINUTE : 1;

        return fromSecondOfDay(getSecondOfDay(value) + delta * step, value.second !== undefined);
    };

    /**
     * The three conversions a 12-hour field needs, kept here rather than in the field because they are the
     * whole of what it is easy to get wrong: **midnight reads as 12 am and noon as 12 pm**, so the mapping is
     * not `hour % 12` in either direction and no type catches it. The value itself stays 24-hour — a
     * meridiem is a way of reading an hour, not a fourth field.
     */
    export const getMeridiem = (value: TimeValue): TimeValueMeridiem => (value.hour < HOURS_PER_HALF_DAY ? "am" : "pm");

    export const getTwelveHour = (value: TimeValue) => value.hour % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY;

    export const withMeridiem = (value: TimeValue, meridiem: TimeValueMeridiem): TimeValue => ({
        ...value,
        hour: (getTwelveHour(value) % HOURS_PER_HALF_DAY) + (meridiem === "pm" ? HOURS_PER_HALF_DAY : 0),
    });

    export const fromTwelveHour = (
        hour: number,
        minute: number,
        meridiem: TimeValueMeridiem,
        second?: number,
    ): TimeValue | undefined => {
        if (hour < 1 || hour > HOURS_PER_HALF_DAY || minute >= MINUTES_PER_HOUR) return;
        if (second !== undefined && second >= SECONDS_PER_MINUTE) return;

        const base = { hour: hour % HOURS_PER_HALF_DAY, minute, ...(second === undefined ? {} : { second }) };

        return withMeridiem(base, meridiem);
    };

    export const toIso = (value: TimeValue) =>
        value.second === undefined
            ? `${pad(value.hour)}:${pad(value.minute)}`
            : `${pad(value.hour)}:${pad(value.minute)}:${pad(value.second)}`;

    export const fromIso = (text: string): TimeValue | undefined => {
        if (text.length !== SHORT_LENGTH && text.length !== LONG_LENGTH) return;

        const parts = ISO_PATTERN.exec(text);

        if (!parts) return;

        const hour = Number(parts[1]);
        const minute = Number(parts[2]);
        const second = parts[3] === undefined ? undefined : Number(parts[3]);

        if (hour >= HOURS_PER_DAY || minute >= MINUTES_PER_HOUR) return;
        if (second !== undefined && second >= SECONDS_PER_MINUTE) return;

        return second === undefined ? { hour, minute } : { hour, minute, second };
    };

    export const toTwelveHourText = (value: TimeValue) => toIso({ ...value, hour: getTwelveHour(value) });

    /** The 12-hour twin of `fromIso`: the same strictness about spelling, the meridiem supplied from outside. */
    export const fromTwelveHourText = (text: string, meridiem: TimeValueMeridiem): TimeValue | undefined => {
        if (text.length !== SHORT_LENGTH && text.length !== LONG_LENGTH) return;

        const parts = ISO_PATTERN.exec(text);

        if (!parts) return;

        return fromTwelveHour(
            Number(parts[1]),
            Number(parts[2]),
            meridiem,
            parts[3] === undefined ? undefined : Number(parts[3]),
        );
    };

    export const format = (value: TimeValue, options?: Intl.DateTimeFormatOptions, locale?: string) =>
        new Intl.DateTimeFormat(locale, options).format(
            new Date(ANCHOR_YEAR, 0, 1, value.hour, value.minute, value.second ?? 0),
        );
}
