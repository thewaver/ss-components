import { describe, expect, it } from "vitest";

import { DateValueUtils } from "./DateValue.utils";

const LOCALE = "en-GB";

describe("addMonths", () => {
    it("clamps the day into the target month rather than rolling into the next one", () => {
        expect(DateValueUtils.addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
            year: 2026,
            month: 2,
            day: 28,
        });
        expect(DateValueUtils.addMonths({ year: 2024, month: 3, day: 31 }, -1)).toEqual({
            year: 2024,
            month: 2,
            day: 29,
        });
    });

    it("crosses years in both directions", () => {
        expect(DateValueUtils.addMonths({ year: 2026, month: 12, day: 5 }, 1)).toEqual({
            year: 2027,
            month: 1,
            day: 5,
        });
        expect(DateValueUtils.addMonths({ year: 2026, month: 1, day: 5 }, -1)).toEqual({
            year: 2025,
            month: 12,
            day: 5,
        });
        expect(DateValueUtils.addMonths({ year: 2026, month: 1, day: 5 }, -13)).toEqual({
            year: 2024,
            month: 12,
            day: 5,
        });
    });
});

describe("addDays", () => {
    it("crosses month and year boundaries", () => {
        expect(DateValueUtils.addDays({ year: 2026, month: 8, day: 31 }, 1)).toEqual({
            year: 2026,
            month: 9,
            day: 1,
        });
        expect(DateValueUtils.addDays({ year: 2026, month: 1, day: 1 }, -1)).toEqual({
            year: 2025,
            month: 12,
            day: 31,
        });
    });

    it("counts a leap day", () => {
        expect(DateValueUtils.addDays({ year: 2024, month: 2, day: 28 }, 1)).toEqual({
            year: 2024,
            month: 2,
            day: 29,
        });
        expect(DateValueUtils.addDays({ year: 2026, month: 2, day: 28 }, 1)).toEqual({
            year: 2026,
            month: 3,
            day: 1,
        });
    });

    it("advances exactly one calendar day across a daylight-saving change", () => {
        expect(DateValueUtils.addDays({ year: 2026, month: 3, day: 29 }, 1)).toEqual({
            year: 2026,
            month: 3,
            day: 30,
        });
        expect(DateValueUtils.addDays({ year: 2026, month: 10, day: 25 }, 1)).toEqual({
            year: 2026,
            month: 10,
            day: 26,
        });
    });
});

describe("getDaysInMonth", () => {
    it("knows the short months and the leap years", () => {
        expect(DateValueUtils.getDaysInMonth(2026, 2)).toBe(28);
        expect(DateValueUtils.getDaysInMonth(2024, 2)).toBe(29);
        expect(DateValueUtils.getDaysInMonth(2000, 2)).toBe(29);
        expect(DateValueUtils.getDaysInMonth(1900, 2)).toBe(28);
        expect(DateValueUtils.getDaysInMonth(2026, 4)).toBe(30);
        expect(DateValueUtils.getDaysInMonth(2026, 12)).toBe(31);
    });
});

describe("fromIso", () => {
    it("reads a complete date", () => {
        expect(DateValueUtils.fromIso("2026-08-10")).toEqual({ year: 2026, month: 8, day: 10 });
    });

    it("refuses a date that does not exist rather than normalising it", () => {
        expect(DateValueUtils.fromIso("2026-02-31")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-13-01")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-00-10")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-04-31")).toBe(undefined);
    });

    it("refuses anything incomplete or misshaped, so a half-typed field reports no value", () => {
        expect(DateValueUtils.fromIso("2026-08-1")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-8-10")).toBe(undefined);
        expect(DateValueUtils.fromIso("")).toBe(undefined);
        expect(DateValueUtils.fromIso("aaaa-bb-cc")).toBe(undefined);
    });

    it("round-trips through toIso", () => {
        expect(DateValueUtils.toIso({ year: 2026, month: 8, day: 10 })).toBe("2026-08-10");
        expect(DateValueUtils.fromIso(DateValueUtils.toIso({ year: 999, month: 1, day: 2 }))).toEqual({
            year: 999,
            month: 1,
            day: 2,
        });
    });
});

describe("getMonthGrid", () => {
    it("is always six weeks of seven days, so paging never changes its height", () => {
        for (const month of [2, 5, 8, 11]) {
            const grid = DateValueUtils.getMonthGrid(2026, month, 1);

            expect(grid.weeks).toHaveLength(6);
            expect(grid.weeks.every((week) => week.length === 7)).toBe(true);
        }
    });

    it("starts on the requested weekday and carries the neighbouring months' days", () => {
        const mondayFirst = DateValueUtils.getMonthGrid(2026, 8, 1);

        expect(mondayFirst.weeks[0][0], "August 2026 starts on a Saturday, so a Monday grid opens in July").toEqual({
            year: 2026,
            month: 7,
            day: 27,
        });

        const sundayFirst = DateValueUtils.getMonthGrid(2026, 8, 0);

        expect(sundayFirst.weeks[0][0], "and a Sunday grid opens a day later").toEqual({
            year: 2026,
            month: 7,
            day: 26,
        });
    });

    it("runs continuously, one day per cell", () => {
        const grid = DateValueUtils.getMonthGrid(2026, 2, 1);
        const flat = grid.weeks.flat();

        expect(flat).toHaveLength(42);
        expect(
            flat.every(
                (day, index) => index === 0 || DateValueUtils.isSame(day, DateValueUtils.addDays(flat[index - 1], 1)),
            ),
        ).toBe(true);
    });

    it("locates a date by cell, and reports nothing for one outside the grid", () => {
        const grid = DateValueUtils.getMonthGrid(2026, 8, 1);

        expect(DateValueUtils.getCellOf(grid, { year: 2026, month: 8, day: 1 })).toEqual({ x: 5, y: 0 });
        expect(DateValueUtils.getCellOf(grid, { year: 2027, month: 1, day: 1 })).toBe(undefined);
    });
});

describe("getWeekdayNames", () => {
    it("rotates to the requested week start", () => {
        expect(DateValueUtils.getWeekdayNames(1, "short", LOCALE)[0]).toBe("Mon");
        expect(DateValueUtils.getWeekdayNames(0, "short", LOCALE)[0]).toBe("Sun");
        expect(DateValueUtils.getWeekdayNames(6, "short", LOCALE)[0]).toBe("Sat");
    });

    it("is seven distinct names whatever the width", () => {
        expect(new Set(DateValueUtils.getWeekdayNames(1, "long", LOCALE)).size).toBe(7);
    });
});

describe("getMonthNames", () => {
    it("is twelve names in calendar order", () => {
        const names = DateValueUtils.getMonthNames(LOCALE);

        expect(names).toHaveLength(12);
        expect(names[0]).toBe("January");
        expect(names[11]).toBe("December");
    });
});

describe("clamp and getIsInRange", () => {
    it("pulls a date into the range and reports which side it was on", () => {
        const min = { year: 2026, month: 8, day: 5 };
        const max = { year: 2026, month: 8, day: 20 };

        expect(DateValueUtils.clamp({ year: 2026, month: 8, day: 1 }, min, max)).toEqual(min);
        expect(DateValueUtils.clamp({ year: 2026, month: 8, day: 25 }, min, max)).toEqual(max);
        expect(DateValueUtils.clamp({ year: 2026, month: 8, day: 10 }, min, max)).toEqual({
            year: 2026,
            month: 8,
            day: 10,
        });

        expect(DateValueUtils.getIsInRange({ year: 2026, month: 8, day: 5 }, min, max)).toBe(true);
        expect(DateValueUtils.getIsInRange({ year: 2026, month: 8, day: 4 }, min, max)).toBe(false);
        expect(DateValueUtils.getIsInRange({ year: 2026, month: 8, day: 4 })).toBe(true);
    });
});
