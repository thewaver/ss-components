import type { CalendarDate } from "@internationalized/date";

export type DateValue = CalendarDate;

export type DateValueCalendarId =
    | "gregory"
    | "buddhist"
    | "coptic"
    | "ethiopic"
    | "ethioaa"
    | "hebrew"
    | "indian"
    | "islamic-civil"
    | "islamic-tbla"
    | "islamic-umalqura"
    | "japanese"
    | "persian"
    | "roc";

export type DateValueEra = {
    id: string;
    name: string;
    shortName: string;
};

export type DateValueParts = {
    calendar: DateValueCalendarId;
    era: string;
    year: number;
    month: number;
    day: number;
};

export type DateValueRange = {
    start: DateValue;
    end: DateValue;
};

export type DateValueWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DateValueWeekdayWidth = "narrow" | "short" | "long";

export type DateValueMonthGrid = {
    anchor: DateValue;
    weeks: DateValue[][];
};
