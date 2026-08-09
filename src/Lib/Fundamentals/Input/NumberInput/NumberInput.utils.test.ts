import { describe, expect, it } from "vitest";

import { NumberInputUtils } from "./NumberInput.utils";

describe("sanitizeText", () => {
    it("drops anything that cannot appear in a number", () => {
        expect(NumberInputUtils.sanitizeText("12ab34")).toBe("1234");
        expect(NumberInputUtils.sanitizeText("abc")).toBe("");
    });

    it("keeps a half-typed value typeable", () => {
        expect(NumberInputUtils.sanitizeText("-")).toBe("-");
        expect(NumberInputUtils.sanitizeText("1.")).toBe("1.");
        expect(NumberInputUtils.sanitizeText("1e")).toBe("1e");
        expect(NumberInputUtils.sanitizeText("1e-")).toBe("1e-");
    });

    it("allows a sign only where a sign can go", () => {
        expect(NumberInputUtils.sanitizeText("1-2")).toBe("12");
        expect(NumberInputUtils.sanitizeText("+5")).toBe("5");
        expect(NumberInputUtils.sanitizeText("1e+5")).toBe("1e+5");
    });

    it("allows one decimal point and one exponent", () => {
        expect(NumberInputUtils.sanitizeText("1.2.3")).toBe("1.23");
        expect(NumberInputUtils.sanitizeText("1e2e3")).toBe("1e23");
        expect(NumberInputUtils.sanitizeText("1e2.5")).toBe("1e25");
    });

    it("refuses an exponent with no digits in front of it", () => {
        expect(NumberInputUtils.sanitizeText("e5")).toBe("5");
    });
});

describe("parseValue", () => {
    it("reads a written number", () => {
        expect(NumberInputUtils.parseValue("42")).toBe(42);
        expect(NumberInputUtils.parseValue("-1.5")).toBe(-1.5);
        expect(NumberInputUtils.parseValue("1.")).toBe(1);
    });

    it("reports no value for an empty or half-typed field", () => {
        expect(NumberInputUtils.parseValue("")).toBeUndefined();
        expect(NumberInputUtils.parseValue("-")).toBeUndefined();
        expect(NumberInputUtils.parseValue("1e")).toBeUndefined();
    });
});

describe("clampValue", () => {
    it("holds the value inside the range it is given", () => {
        expect(NumberInputUtils.clampValue(5, { min: 10, max: 20 })).toBe(10);
        expect(NumberInputUtils.clampValue(25, { min: 10, max: 20 })).toBe(20);
        expect(NumberInputUtils.clampValue(15, { min: 10, max: 20 })).toBe(15);
    });

    it("leaves an open end open", () => {
        expect(NumberInputUtils.clampValue(-100, { max: 20 })).toBe(-100);
        expect(NumberInputUtils.clampValue(100, { min: 10 })).toBe(100);
    });
});

describe("computeStep", () => {
    it("moves a whole step from a value already on the ladder", () => {
        expect(NumberInputUtils.computeStep(4, 1, { min: 0, step: 2 })).toBe(6);
        expect(NumberInputUtils.computeStep(4, -1, { min: 0, step: 2 })).toBe(2);
    });

    it("snaps a value between rungs to the next rung in the direction of travel", () => {
        expect(NumberInputUtils.computeStep(3, 1, { min: 0, step: 2 })).toBe(4);
        expect(NumberInputUtils.computeStep(3, -1, { min: 0, step: 2 })).toBe(2);
    });

    it("counts the ladder from min rather than from zero", () => {
        expect(NumberInputUtils.computeStep(-3, 1, { min: -10, step: 2 })).toBe(-2);
        expect(NumberInputUtils.computeStep(-3, -1, { min: -10, step: 2 })).toBe(-4);
    });

    it("does not drift on a fractional step", () => {
        expect(NumberInputUtils.computeStep(0.3, 1, { min: 0, step: 0.1 })).toBe(0.4);
        expect(NumberInputUtils.computeStep(0.3, -1, { min: 0, step: 0.1 })).toBe(0.2);
        expect(NumberInputUtils.computeStep(0.1, 1, { min: 0, step: 0.2 })).toBe(0.2);
    });

    it("lands on the floor when the field is empty", () => {
        expect(NumberInputUtils.computeStep(undefined, 1, { min: 10, step: 5 })).toBe(10);
        expect(NumberInputUtils.computeStep(undefined, -1, { step: 5 })).toBe(0);
    });

    it("stays inside the range", () => {
        expect(NumberInputUtils.computeStep(99, 1, { min: 0, max: 100, step: 5 })).toBe(100);
        expect(NumberInputUtils.computeStep(0, -1, { min: 0, max: 100, step: 5 })).toBe(0);
    });

    it("stands still rather than looping when the step is not a step", () => {
        expect(NumberInputUtils.computeStep(7, 1, { step: 0 })).toBe(7);
    });
});
