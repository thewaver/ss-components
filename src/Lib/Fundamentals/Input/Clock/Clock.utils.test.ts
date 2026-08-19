import { describe, expect, it } from "vitest";

import { ClockUtils } from "./Clock.utils";

describe("ClockUtils.getReadings", () => {
    it("runs a twelve-hour column from twelve rather than from one", () => {
        expect(ClockUtils.getReadings("hour", true, 1)).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it("runs a twenty-four-hour column from zero", () => {
        expect(ClockUtils.getReadings("hour", false, 1)).toHaveLength(24);
        expect(ClockUtils.getReadings("hour", false, 1)[0]).toBe(0);
    });

    it("coarsens a column by the step without shortening its range", () => {
        expect(ClockUtils.getReadings("minute", false, 15)).toEqual([0, 15, 30, 45]);
        expect(ClockUtils.getReadings("second", false, 10)).toEqual([0, 10, 20, 30, 40, 50]);
    });

    it("ignores a step on the meridiem column, which has exactly two readings", () => {
        expect(ClockUtils.getReadings("meridiem", true, 5)).toEqual([0, 1]);
    });
});

describe("ClockUtils.getReading and withReading", () => {
    it("reads midnight as twelve am and noon as twelve pm", () => {
        expect(ClockUtils.getReading("hour", { hour: 0, minute: 0 }, true)).toBe(12);
        expect(ClockUtils.getReading("hour", { hour: 12, minute: 0 }, true)).toBe(12);
        expect(ClockUtils.getReading("meridiem", { hour: 0, minute: 0 }, true)).toBe(0);
        expect(ClockUtils.getReading("meridiem", { hour: 12, minute: 0 }, true)).toBe(1);
    });

    it("writes a twelve-hour reading back into the half of the day the value is already in", () => {
        expect(ClockUtils.withReading("hour", 9, { hour: 14, minute: 30 }, true)).toEqual({ hour: 21, minute: 30 });
        expect(ClockUtils.withReading("hour", 12, { hour: 14, minute: 30 }, true)).toEqual({ hour: 12, minute: 30 });
        expect(ClockUtils.withReading("hour", 12, { hour: 2, minute: 30 }, true)).toEqual({ hour: 0, minute: 30 });
    });

    it("changes one unit and carries the rest through untouched", () => {
        expect(ClockUtils.withReading("minute", 45, { hour: 9, minute: 30, second: 15 }, false)).toEqual({
            hour: 9,
            minute: 45,
            second: 15,
        });
    });

    it("adds a seconds field to a value that had none", () => {
        expect(ClockUtils.withReading("second", 5, { hour: 9, minute: 30 }, false)).toEqual({
            hour: 9,
            minute: 30,
            second: 5,
        });
    });
});

/**
 * A stepped column rarely holds the value's own reading, so the roving position resolves to the closest row
 * it does hold rather than failing to resolve at all.
 */
describe("ClockUtils.getNearestIndex", () => {
    it("lands on an exact reading when the column holds one", () => {
        expect(ClockUtils.getNearestIndex([0, 15, 30, 45], 30)).toBe(2);
    });

    it("lands on the closest reading when it does not", () => {
        expect(ClockUtils.getNearestIndex([0, 15, 30, 45], 47)).toBe(3);
        expect(ClockUtils.getNearestIndex([0, 15, 30, 45], 7)).toBe(0);
    });
});
