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
