import { TimeUtils } from "@thewaver/ss-utils";
import type { TimeValue, TimeValueMeridiem } from "@thewaver/ss-utils";

import type { ClockUnit } from "./Clock.types";

const NAME_FIELDS: Record<ClockUnit, Intl.DateTimeFormatPartTypes> = {
    hour: "hour",
    minute: "minute",
    second: "second",
    meridiem: "dayPeriod",
};

const UNIT_LENGTHS: Record<ClockUnit, number> = { hour: 24, minute: 60, second: 60, meridiem: 2 };
const TWELVE_HOUR_LENGTH = 12;

const MERIDIEM_ANCHOR_HOURS: Record<TimeValueMeridiem, number> = { am: 9, pm: 21 };
const MERIDIEM_ANCHOR_YEAR = 2021;
const MERIDIEM_ANCHOR_MONTH = 7;
const MERIDIEM_ANCHOR_DAY = 1;

export namespace ClockUtils {
    export const MERIDIEMS: TimeValueMeridiem[] = ["am", "pm"];

    export const getUnitName = (unit: ClockUnit, locale?: string) =>
        new Intl.DisplayNames(locale ?? [], { type: "dateTimeField" }).of(NAME_FIELDS[unit]) ?? unit;

    export const getMeridiemNames = (locale?: string): Record<TimeValueMeridiem, string> => {
        const formatter = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true });

        const read = (hour: number) =>
            formatter
                .formatToParts(new Date(MERIDIEM_ANCHOR_YEAR, MERIDIEM_ANCHOR_MONTH, MERIDIEM_ANCHOR_DAY, hour))
                .find((part) => part.type === "dayPeriod")?.value ?? "";

        return { am: read(MERIDIEM_ANCHOR_HOURS.am), pm: read(MERIDIEM_ANCHOR_HOURS.pm) };
    };

    export const getReading = (unit: ClockUnit, time: TimeValue, isTwelveHour: boolean) => {
        if (unit === "hour") return isTwelveHour ? TimeUtils.getTwelveHour(time) : time.hour;
        if (unit === "minute") return time.minute;
        if (unit === "second") return time.second ?? 0;

        return MERIDIEMS.indexOf(TimeUtils.getMeridiem(time));
    };

    export const withReading = (
        unit: ClockUnit,
        reading: number,
        time: TimeValue,
        isTwelveHour: boolean,
    ): TimeValue => {
        if (unit === "meridiem") return TimeUtils.withMeridiem(time, MERIDIEMS[reading]);
        if (unit === "minute") return { ...time, minute: reading };
        if (unit === "second") return { ...time, second: reading };
        if (!isTwelveHour) return { ...time, hour: reading };

        return TimeUtils.fromTwelveHour(reading, time.minute, TimeUtils.getMeridiem(time), time.second) ?? time;
    };

    export const getReadings = (unit: ClockUnit, isTwelveHour: boolean, step: number) => {
        const isTwelveHourColumn = unit === "hour" && isTwelveHour;
        const length = isTwelveHourColumn ? TWELVE_HOUR_LENGTH : UNIT_LENGTHS[unit];
        const stride = unit === "meridiem" ? 1 : Math.max(1, Math.floor(step));

        return Array.from({ length: Math.ceil(length / stride) }, (_, index) => {
            const reading = index * stride;

            return isTwelveHourColumn && reading === 0 ? TWELVE_HOUR_LENGTH : reading;
        });
    };

    export const getNearestIndex = (readings: number[], target: number) =>
        readings.reduce(
            (best, reading, index) => (Math.abs(reading - target) < Math.abs(readings[best] - target) ? index : best),
            0,
        );
}
