import { describe, expect, it } from "vitest";

import { TimeValueUtils } from "./TimeValue.utils";

const LOCALE = "en-GB";

describe("fromIso", () => {
    it("reads both the short and the long form", () => {
        expect(TimeValueUtils.fromIso("09:30")).toEqual({ hour: 9, minute: 30 });
        expect(TimeValueUtils.fromIso("09:30:45")).toEqual({ hour: 9, minute: 30, second: 45 });
        expect(TimeValueUtils.fromIso("00:00")).toEqual({ hour: 0, minute: 0 });
        expect(TimeValueUtils.fromIso("23:59")).toEqual({ hour: 23, minute: 59 });
    });

    it("refuses a time that does not exist rather than wrapping it", () => {
        expect(TimeValueUtils.fromIso("24:00")).toBe(undefined);
        expect(TimeValueUtils.fromIso("09:60")).toBe(undefined);
        expect(TimeValueUtils.fromIso("09:30:60")).toBe(undefined);
    });

    it("refuses anything incomplete or misshaped", () => {
        expect(TimeValueUtils.fromIso("9:30")).toBe(undefined);
        expect(TimeValueUtils.fromIso("09:3")).toBe(undefined);
        expect(TimeValueUtils.fromIso("0930")).toBe(undefined);
        expect(TimeValueUtils.fromIso("")).toBe(undefined);
        expect(TimeValueUtils.fromIso("aa:bb")).toBe(undefined);
    });

    it("round-trips through toIso, keeping the shape it was given", () => {
        expect(TimeValueUtils.toIso({ hour: 9, minute: 5 })).toBe("09:05");
        expect(TimeValueUtils.toIso({ hour: 9, minute: 5, second: 7 })).toBe("09:05:07");
        expect(TimeValueUtils.fromIso(TimeValueUtils.toIso({ hour: 23, minute: 59, second: 59 }))).toEqual({
            hour: 23,
            minute: 59,
            second: 59,
        });
    });
});

describe("addUnit", () => {
    it("steps one unit at a time", () => {
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 30 }, "hour", 1)).toEqual({ hour: 10, minute: 30 });
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 30 }, "minute", -1)).toEqual({ hour: 9, minute: 29 });
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 30, second: 0 }, "second", 5)).toEqual({
            hour: 9,
            minute: 30,
            second: 5,
        });
    });

    it("carries between units", () => {
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 59 }, "minute", 1)).toEqual({ hour: 10, minute: 0 });
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 0 }, "minute", -1)).toEqual({ hour: 8, minute: 59 });
    });

    it("wraps around the day rather than leaving the clock", () => {
        expect(TimeValueUtils.addUnit({ hour: 23, minute: 30 }, "hour", 1)).toEqual({ hour: 0, minute: 30 });
        expect(TimeValueUtils.addUnit({ hour: 0, minute: 0 }, "minute", -1)).toEqual({ hour: 23, minute: 59 });
        expect(TimeValueUtils.addUnit({ hour: 0, minute: 0 }, "hour", -25)).toEqual({ hour: 23, minute: 0 });
    });

    it("keeps seconds only when the value already had them", () => {
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 30 }, "hour", 1).second).toBe(undefined);
        expect(TimeValueUtils.addUnit({ hour: 9, minute: 30, second: 0 }, "hour", 1).second).toBe(0);
    });
});

describe("compare, clamp and getIsInRange", () => {
    it("orders by the second of the day, so shapes mix safely", () => {
        expect(TimeValueUtils.compare({ hour: 9, minute: 0 }, { hour: 9, minute: 0, second: 0 })).toBe(0);
        expect(TimeValueUtils.isSame({ hour: 9, minute: 0 }, { hour: 9, minute: 0, second: 0 })).toBe(true);
        expect(TimeValueUtils.compare({ hour: 9, minute: 0 }, { hour: 9, minute: 1 })).toBeLessThan(0);
    });

    it("pulls a time into the range and reports which side it was on", () => {
        const min = { hour: 9, minute: 0 };
        const max = { hour: 17, minute: 0 };

        expect(TimeValueUtils.clamp({ hour: 8, minute: 0 }, min, max)).toEqual(min);
        expect(TimeValueUtils.clamp({ hour: 18, minute: 0 }, min, max)).toEqual(max);
        expect(TimeValueUtils.getIsInRange({ hour: 9, minute: 0 }, min, max)).toBe(true);
        expect(TimeValueUtils.getIsInRange({ hour: 8, minute: 59 }, min, max)).toBe(false);
    });
});

describe("format", () => {
    it("goes through Intl, so the clock convention is the locale's", () => {
        expect(TimeValueUtils.format({ hour: 13, minute: 5 }, { hour: "2-digit", minute: "2-digit" }, LOCALE)).toBe(
            "13:05",
        );
        expect(TimeValueUtils.format({ hour: 13, minute: 5 }, { hour: "numeric", minute: "2-digit" }, "en-US")).toBe(
            "1:05 PM",
        );
    });
});

describe("the twelve-hour reading", () => {
    it("reads midnight as 12 am and noon as 12 pm, which is where the off-by-twelve lives", () => {
        expect(
            TimeValueUtils.getTwelveHour({ hour: 0, minute: 0 }),
            "midnight is the twelfth hour, not the zeroth",
        ).toBe(12);
        expect(TimeValueUtils.getMeridiem({ hour: 0, minute: 0 })).toBe("am");
        expect(TimeValueUtils.getTwelveHour({ hour: 12, minute: 0 })).toBe(12);
        expect(TimeValueUtils.getMeridiem({ hour: 12, minute: 0 }), "noon is pm, not am").toBe("pm");
    });

    it("reads the ordinary hours the ordinary way", () => {
        expect(TimeValueUtils.getTwelveHour({ hour: 9, minute: 30 })).toBe(9);
        expect(TimeValueUtils.getMeridiem({ hour: 9, minute: 30 })).toBe("am");
        expect(TimeValueUtils.getTwelveHour({ hour: 13, minute: 30 })).toBe(1);
        expect(TimeValueUtils.getMeridiem({ hour: 13, minute: 30 })).toBe("pm");
        expect(TimeValueUtils.getTwelveHour({ hour: 23, minute: 59 })).toBe(11);
    });

    it("moves an hour between halves of the day without touching the rest of it", () => {
        expect(TimeValueUtils.withMeridiem({ hour: 9, minute: 30 }, "pm")).toEqual({ hour: 21, minute: 30 });
        expect(TimeValueUtils.withMeridiem({ hour: 21, minute: 30 }, "am")).toEqual({ hour: 9, minute: 30 });
        expect(TimeValueUtils.withMeridiem({ hour: 0, minute: 5 }, "pm"), "12 am becomes 12 pm").toEqual({
            hour: 12,
            minute: 5,
        });
        expect(TimeValueUtils.withMeridiem({ hour: 12, minute: 5 }, "am"), "and back again").toEqual({
            hour: 0,
            minute: 5,
        });
    });

    it("is idempotent when the half of the day already matches", () => {
        expect(TimeValueUtils.withMeridiem({ hour: 13, minute: 0 }, "pm")).toEqual({ hour: 13, minute: 0 });
        expect(TimeValueUtils.withMeridiem({ hour: 1, minute: 0 }, "am")).toEqual({ hour: 1, minute: 0 });
    });

    it("keeps seconds through the conversion, and only when they were there", () => {
        expect(TimeValueUtils.withMeridiem({ hour: 9, minute: 30, second: 15 }, "pm")).toEqual({
            hour: 21,
            minute: 30,
            second: 15,
        });
        expect(TimeValueUtils.withMeridiem({ hour: 9, minute: 30 }, "pm")).not.toHaveProperty("second");
    });

    it("refuses a twelve-hour reading that is not one", () => {
        expect(
            TimeValueUtils.fromTwelveHour(0, 30, "am"),
            "there is no zeroth hour on a 12-hour clock",
        ).toBeUndefined();
        expect(TimeValueUtils.fromTwelveHour(13, 30, "pm"), "nor a thirteenth").toBeUndefined();
        expect(TimeValueUtils.fromTwelveHour(9, 60, "am"), "nor a sixtieth minute").toBeUndefined();
        expect(TimeValueUtils.fromTwelveHour(9, 30, "am", 60)).toBeUndefined();
    });

    it("builds the value the field means from the digits and the half of the day", () => {
        expect(TimeValueUtils.fromTwelveHour(12, 30, "am"), "12:30 am is half past midnight").toEqual({
            hour: 0,
            minute: 30,
        });
        expect(TimeValueUtils.fromTwelveHour(12, 30, "pm"), "12:30 pm is half past noon").toEqual({
            hour: 12,
            minute: 30,
        });
        expect(TimeValueUtils.fromTwelveHour(1, 5, "pm")).toEqual({ hour: 13, minute: 5 });
        expect(TimeValueUtils.fromTwelveHour(11, 45, "am", 30)).toEqual({ hour: 11, minute: 45, second: 30 });
    });
});
