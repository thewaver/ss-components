export type DateValue = {
    year: number;
    month: number;
    day: number;
};

export type DateValueWeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DateValueWeekdayWidth = "narrow" | "short" | "long";

export type DateValueMonthGrid = {
    year: number;
    month: number;
    weeks: DateValue[][];
};
