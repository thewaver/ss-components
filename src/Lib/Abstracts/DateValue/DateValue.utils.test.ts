import { describe, expect, it } from "vitest";

import { CalendarDate } from "@internationalized/date";

import type { DateValueCalendarId } from "./DateValue.types";
import { DateValueUtils } from "./DateValue.utils";

const gregorian = (year: number, month: number, day: number) => new CalendarDate(year, month, day);

const inCalendar = (id: DateValueCalendarId, year: number, month: number, day: number) =>
    DateValueUtils.withCalendar(gregorian(year, month, day), id);

describe("getCalendarIds", () => {
    it("offers only the calendars that are really implemented", () => {
        const ids = DateValueUtils.getCalendarIds();

        expect(ids).toContain("gregory");
        expect(ids).toContain("hebrew");
        expect(ids).toContain("japanese");
        expect(ids).not.toContain("chinese");
        expect(ids).not.toContain("dangi");
    });

    it("round-trips every offered calendar without falling back to Gregorian", () => {
        for (const id of DateValueUtils.getCalendarIds()) {
            expect(DateValueUtils.getCalendarId(inCalendar(id, 2026, 8, 11)), id).toBe(id);
        }
    });
});

describe("addMonths", () => {
    it("clamps the day to the shorter target month", () => {
        expect(DateValueUtils.toIso(DateValueUtils.addMonths(gregorian(2026, 1, 31), 1))).toBe("2026-02-28");
        expect(DateValueUtils.toIso(DateValueUtils.addMonths(gregorian(2024, 3, 31), -1))).toBe("2024-02-29");
    });

    it("carries across the year boundary in both directions", () => {
        expect(DateValueUtils.toIso(DateValueUtils.addMonths(gregorian(2026, 12, 5), 1))).toBe("2027-01-05");
        expect(DateValueUtils.toIso(DateValueUtils.addMonths(gregorian(2026, 1, 5), -1))).toBe("2025-12-05");
        expect(DateValueUtils.toIso(DateValueUtils.addMonths(gregorian(2026, 1, 5), -13))).toBe("2024-12-05");
    });

    it("steps through a thirteenth month rather than over it", () => {
        const adarOne = inCalendar("hebrew", 2024, 2, 10);

        expect(adarOne.month).toBe(6);
        expect(DateValueUtils.addMonths(adarOne, 1).month).toBe(7);
        expect(DateValueUtils.getMonthsInYear(adarOne)).toBe(13);
    });
});

describe("addDays", () => {
    it("crosses month, year and leap-day boundaries", () => {
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2026, 8, 31), 1))).toBe("2026-09-01");
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2026, 1, 1), -1))).toBe("2025-12-31");
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2024, 2, 28), 1))).toBe("2024-02-29");
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2026, 2, 28), 1))).toBe("2026-03-01");
    });

    it("advances exactly one calendar day across a daylight-saving change", () => {
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2026, 3, 29), 1))).toBe("2026-03-30");
        expect(DateValueUtils.toIso(DateValueUtils.addDays(gregorian(2026, 10, 25), 1))).toBe("2026-10-26");
    });
});

describe("getDaysInMonth", () => {
    it("reads the Gregorian leap rules off the calendar", () => {
        expect(DateValueUtils.getDaysInMonth(gregorian(2026, 2, 1))).toBe(28);
        expect(DateValueUtils.getDaysInMonth(gregorian(2024, 2, 1))).toBe(29);
        expect(DateValueUtils.getDaysInMonth(gregorian(2000, 2, 1))).toBe(29);
        expect(DateValueUtils.getDaysInMonth(gregorian(1900, 2, 1))).toBe(28);
        expect(DateValueUtils.getDaysInMonth(gregorian(2026, 4, 1))).toBe(30);
    });

    it("reads a month length that has nothing to do with Gregorian", () => {
        expect(DateValueUtils.getDaysInMonth(inCalendar("ethiopic", 2026, 9, 15))).toBe(30);
    });
});

describe("eras", () => {
    it("names both Gregorian eras rather than assuming them", () => {
        const eras = DateValueUtils.getEras(gregorian(2026, 8, 11), "en-US");

        expect(eras.map((era) => era.id)).toEqual(["BC", "AD"]);
        expect(eras.map((era) => era.name)).toEqual(["Before Christ", "Anno Domini"]);
        expect(
            eras.map((era) => era.shortName),
            "the short form is what a compact control shows",
        ).toEqual(["BC", "AD"]);
    });

    it("finds every Japanese era and its name", () => {
        const eras = DateValueUtils.getEras(inCalendar("japanese", 2026, 8, 11), "en-US");

        expect(eras.map((era) => era.id)).toEqual(["meiji", "taisho", "showa", "heisei", "reiwa"]);
        expect(
            eras.map((era) => era.name),
            "every era, not only the last one",
        ).toEqual(["Meiji", "Taishō", "Shōwa", "Heisei", "Reiwa"]);
        expect(eras.length).toBeGreaterThan(2);
    });

    it("counts the year inside the era, not since an epoch", () => {
        const reiwa = inCalendar("japanese", 2026, 12, 25);

        expect(reiwa.era).toBe("reiwa");
        expect(reiwa.year).toBe(8);
    });

    it("expresses a date before the common era as an era plus a positive year", () => {
        const caesar = DateValueUtils.fromIso("-000043-08-15");

        expect(caesar?.era).toBe("BC");
        expect(caesar?.year).toBe(44);
        expect(DateValueUtils.toIso(caesar!)).toBe("-000043-08-15");
    });

    it("moves a date between eras keeping the year within the era", () => {
        const showa = DateValueUtils.withEra(inCalendar("japanese", 2026, 12, 25), "showa");

        expect(showa.era).toBe("showa");
        expect(showa.year).toBe(8);
        expect(DateValueUtils.toIso(showa)).toBe("1933-12-25");
    });
});

describe("toIso and fromIso", () => {
    it("round-trips a plain year", () => {
        expect(DateValueUtils.toIso(gregorian(44, 8, 1))).toBe("0044-08-01");
        expect(DateValueUtils.toIso(DateValueUtils.fromIso("0044-08-01")!)).toBe("0044-08-01");
    });

    it("spells a year before the common era in the expanded form, and reads it back", () => {
        expect(DateValueUtils.toIso(DateValueUtils.fromIso("-000044-03-15")!)).toBe("-000044-03-15");
        expect(DateValueUtils.toIso(new CalendarDate("BC", 44, 3, 15))).toBe("-000043-03-15");
    });

    it("refuses a year past the end of the era rather than constraining it", () => {
        expect(DateValueUtils.fromIso("+012026-08-01")).toBe(undefined);
        expect(DateValueUtils.getYearsInEra(gregorian(2026, 1, 1))).toBe(9999);
    });

    it("serialises to the same ISO day whatever calendar the value is in", () => {
        for (const id of DateValueUtils.getCalendarIds()) {
            expect(DateValueUtils.toIso(inCalendar(id, 2026, 8, 11)), id).toBe("2026-08-11");
        }
    });

    it("refuses a malformed string, an impossible day and a negative year zero", () => {
        expect(DateValueUtils.fromIso("nope")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-02-31")).toBe(undefined);
        expect(DateValueUtils.fromIso("2026-13-01")).toBe(undefined);
        expect(DateValueUtils.fromIso("-000000-01-01")).toBe(undefined);
    });

    it("reads an ISO string straight into another calendar", () => {
        const hebrew = DateValueUtils.fromIso("2024-02-10", "hebrew");

        expect(hebrew?.year).toBe(5784);
        expect(hebrew?.month).toBe(6);
    });
});

describe("fromParts", () => {
    it("accepts a date the calendar really has", () => {
        const parts = DateValueUtils.toParts(inCalendar("hebrew", 2024, 2, 10));

        expect(DateValueUtils.toIso(DateValueUtils.fromParts(parts)!)).toBe("2024-02-10");
    });

    it("refuses what the constructor would silently constrain", () => {
        expect(DateValueUtils.fromParts({ calendar: "gregory", era: "AD", year: 2026, month: 2, day: 31 })).toBe(
            undefined,
        );
        expect(DateValueUtils.fromParts({ calendar: "gregory", era: "AD", year: 2026, month: 13, day: 1 })).toBe(
            undefined,
        );
        expect(DateValueUtils.fromParts({ calendar: "hebrew", era: "AM", year: 5786, month: 13, day: 1 })).toBe(
            undefined,
        );
    });

    it("refuses an era the calendar does not have", () => {
        expect(DateValueUtils.fromParts({ calendar: "gregory", era: "reiwa", year: 8, month: 1, day: 1 })).toBe(
            undefined,
        );
    });
});

describe("getMonthGrid", () => {
    it("is six weeks whatever the month and whatever the calendar, so paging never changes its height", () => {
        expect(DateValueUtils.getMonthGrid(gregorian(2026, 2, 1), 0).weeks).toHaveLength(6);
        expect(DateValueUtils.getMonthGrid(gregorian(2026, 8, 1), 1).weeks).toHaveLength(6);
        expect(DateValueUtils.getMonthGrid(inCalendar("hebrew", 2024, 2, 10), 1).weeks).toHaveLength(6);
        expect(DateValueUtils.getMonthGrid(inCalendar("ethiopic", 2026, 9, 15), 1).weeks).toHaveLength(6);
    });

    it("starts every row on the requested weekday", () => {
        for (const weekStartsOn of [0, 1, 6] as const) {
            const grid = DateValueUtils.getMonthGrid(gregorian(2026, 8, 1), weekStartsOn);

            for (const week of grid.weeks) {
                expect(DateValueUtils.toDate(week[0]).getDay(), `week start ${weekStartsOn}`).toBe(weekStartsOn);
            }
        }
    });

    it("covers the whole month and anchors on its first day", () => {
        const anchor = inCalendar("hebrew", 2024, 2, 10);
        const grid = DateValueUtils.getMonthGrid(anchor, 0);

        expect(grid.anchor.day).toBe(1);
        expect(grid.anchor.month).toBe(anchor.month);
        expect(DateValueUtils.getCellOf(grid, grid.anchor)).not.toBe(undefined);
        expect(
            DateValueUtils.getCellOf(
                grid,
                DateValueUtils.addDays(grid.anchor, DateValueUtils.getDaysInMonth(anchor) - 1),
            ),
        ).not.toBe(undefined);
    });

    it("finds a day held in a different calendar from the grid's", () => {
        const grid = DateValueUtils.getMonthGrid(inCalendar("hebrew", 2024, 2, 10), 1);

        expect(DateValueUtils.getCellOf(grid, gregorian(2024, 2, 10))).not.toBe(undefined);
    });

    it("builds a grid for a year before the common era", () => {
        const grid = DateValueUtils.getMonthGrid(DateValueUtils.fromIso("-000043-08-15")!, 1);

        expect(grid.anchor.era).toBe("BC");
        expect(DateValueUtils.getCellOf(grid, DateValueUtils.fromIso("-000043-08-15")!)).not.toBe(undefined);
    });
});

describe("getMonthNames", () => {
    it("names twelve Gregorian months", () => {
        const names = DateValueUtils.getMonthNames(gregorian(2026, 1, 1), "en-US");

        expect(names).toHaveLength(12);
        expect(names[0]).toBe("January");
        expect(names[11]).toBe("December");
    });

    it("names thirteen Hebrew months in a leap year, and twelve otherwise", () => {
        const leap = DateValueUtils.getMonthNames(inCalendar("hebrew", 2024, 2, 10), "en-US");
        const plain = DateValueUtils.getMonthNames(inCalendar("hebrew", 2026, 2, 10), "en-US");

        expect(leap).toHaveLength(13);
        expect(leap).toContain("Adar I");
        expect(leap).toContain("Adar II");
        expect(plain).toHaveLength(12);
        expect(plain).toContain("Adar");
        expect(plain).not.toContain("Adar I");
    });
});

describe("isSame and compare", () => {
    it("treats the same day in two calendars as the same day", () => {
        expect(DateValueUtils.isSame(gregorian(2024, 2, 10), inCalendar("hebrew", 2024, 2, 10))).toBe(true);
        expect(DateValueUtils.compare(gregorian(2024, 2, 10), inCalendar("hebrew", 2024, 2, 10))).toBe(0);
    });

    it("handles a missing value on either side", () => {
        expect(DateValueUtils.isSame(undefined, undefined)).toBe(true);
        expect(DateValueUtils.isSame(gregorian(2026, 1, 1), undefined)).toBe(false);
        expect(DateValueUtils.isSame(undefined, gregorian(2026, 1, 1))).toBe(false);
    });
});

describe("clamp and getIsInRange", () => {
    it("holds a value between two bounds", () => {
        const min = gregorian(2026, 1, 1);
        const max = gregorian(2026, 12, 31);

        expect(DateValueUtils.toIso(DateValueUtils.clamp(gregorian(2025, 6, 1), min, max))).toBe("2026-01-01");
        expect(DateValueUtils.toIso(DateValueUtils.clamp(gregorian(2027, 6, 1), min, max))).toBe("2026-12-31");
        expect(DateValueUtils.getIsInRange(gregorian(2026, 6, 1), min, max)).toBe(true);
        expect(DateValueUtils.getIsInRange(gregorian(2027, 6, 1), min, max)).toBe(false);
    });

    it("compares across calendars, so a bound need not share the value's system", () => {
        expect(DateValueUtils.getIsInRange(inCalendar("hebrew", 2026, 6, 1), gregorian(2026, 1, 1))).toBe(true);
    });
});

describe("getWeekdayNames", () => {
    it("is seven names starting on the requested day", () => {
        expect(DateValueUtils.getWeekdayNames(1, "long", "en-US")).toEqual([
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ]);
    });
});

describe("format", () => {
    it("formats through the value's own calendar without being told which", () => {
        expect(
            DateValueUtils.format(inCalendar("japanese", 2026, 12, 25), { era: "short", year: "numeric" }, "en-US"),
        ).toContain("8");
        expect(DateValueUtils.format(gregorian(2026, 12, 25), { month: "long", day: "numeric" }, "en-US")).toBe(
            "December 25",
        );
    });
});

describe("era names are the locale's, never the identifier", () => {
    it("never offers a raw identifier as something to display", () => {
        for (const id of DateValueUtils.getCalendarIds()) {
            for (const era of DateValueUtils.getEras(inCalendar(id, 2026, 8, 11), "en-GB")) {
                expect(era.shortName, `${id}/${era.id}`).not.toContain("_");
                expect(era.name, `${id}/${era.id}`).not.toContain("_");
            }
        }
    });

    it("reads the Taiwanese era as a word rather than as before_minguo", () => {
        const eras = DateValueUtils.getEras(inCalendar("roc", 2026, 8, 11), "en-GB");

        expect(eras.map((era) => era.id)).toContain("before_minguo");
        expect(eras.map((era) => era.shortName)).not.toContain("before_minguo");
    });

    it("translates with the locale", () => {
        const french = DateValueUtils.getEras(gregorian(2026, 8, 11), "fr-FR");
        const english = DateValueUtils.getEras(gregorian(2026, 8, 11), "en-GB");

        expect(french[1].name).not.toBe(english[1].name);
    });
});

describe("getEraStart, through withEra", () => {
    it("lands on the real first day of an era rather than a searched-for guess", () => {
        const japanese = inCalendar("japanese", 2026, 8, 11);

        expect(DateValueUtils.toIso(DateValueUtils.withEra(japanese.set({ year: 1, month: 9, day: 8 }), "meiji"))).toBe(
            "1868-09-08",
        );
        expect(DateValueUtils.toIso(DateValueUtils.withEra(japanese.set({ year: 1, month: 5, day: 1 }), "reiwa"))).toBe(
            "2019-05-01",
        );
    });

    it("moves the era of a held date and keeps the year within it", () => {
        const reiwa = inCalendar("japanese", 2026, 8, 10);
        const meiji = DateValueUtils.withEra(reiwa, "meiji");

        expect(reiwa.era, "the starting point is the current era").toBe("reiwa");
        expect(meiji.era, "and moving it really moves it").toBe("meiji");
        expect(meiji.year, "with the year read inside the new era").toBe(8);
        expect(DateValueUtils.toIso(meiji)).toBe("1875-08-10");
    });
});

describe("every era of every calendar gets a real name", () => {
    it("never names an era after its neighbour, and never after itself twice", () => {
        for (const id of DateValueUtils.getCalendarIds()) {
            const eras = DateValueUtils.getEras(inCalendar(id, 2026, 8, 11), "en-GB");
            const names = eras.map((era) => era.name);

            expect(new Set(names).size, `${id} names: ${names.join(", ")}`).toBe(eras.length);

            for (const name of names) {
                expect(name, `${id}: a name with a date range in it is ICU naming a neighbouring era`).not.toMatch(
                    /\(\d/,
                );
            }
        }
    });
});

describe("orderRange, isSameRange and getIsWithin", () => {
    it("orders the two ends whichever way round they were picked", () => {
        const forwards = DateValueUtils.orderRange(gregorian(2026, 3, 1), gregorian(2026, 3, 9));
        const backwards = DateValueUtils.orderRange(gregorian(2026, 3, 9), gregorian(2026, 3, 1));

        expect(DateValueUtils.isSameRange(forwards, backwards)).toBe(true);
        expect(forwards.start.day).toBe(1);
        expect(forwards.end.day).toBe(9);
    });

    it("treats a single day as a range of one, rather than as no range", () => {
        const single = DateValueUtils.orderRange(gregorian(2026, 3, 4), gregorian(2026, 3, 4));

        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 4), single)).toBe(true);
    });

    it("counts both ends as inside the span, so a painter can mark them", () => {
        const range = DateValueUtils.orderRange(gregorian(2026, 3, 1), gregorian(2026, 3, 9));

        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 1), range)).toBe(true);
        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 5), range)).toBe(true);
        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 9), range)).toBe(true);
        expect(DateValueUtils.getIsWithin(gregorian(2026, 2, 28), range)).toBe(false);
        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 10), range)).toBe(false);
    });

    it("holds no day at all when there is no range", () => {
        expect(DateValueUtils.getIsWithin(gregorian(2026, 3, 1), undefined)).toBe(false);
        expect(DateValueUtils.isSameRange(undefined, undefined)).toBe(true);
    });
});
