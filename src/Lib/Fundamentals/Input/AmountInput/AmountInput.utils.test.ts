import { describe, expect, it } from "vitest";

import { AmountInputUtils } from "./AmountInput.utils";

describe("getSeparators", () => {
    it("reads both separators out of the locale rather than being told them", () => {
        expect(AmountInputUtils.getSeparators("en-US")).toEqual({ groupSeparator: ",", decimalSeparator: "." });
        expect(AmountInputUtils.getSeparators("de-DE")).toEqual({ groupSeparator: ".", decimalSeparator: "," });
    });

    it("reports a separator for a locale that groups differently, even where the grouping itself is uniform", () => {
        const separators = AmountInputUtils.getSeparators("fr-FR");

        expect(separators.decimalSeparator).toBe(",");
        expect(separators.groupSeparator.length).toBeGreaterThan(0);
    });
});

describe("toDigits and fromDigits", () => {
    it("treats the digits as the value in its smallest unit", () => {
        expect(AmountInputUtils.toDigits(1234.56, 2)).toBe("123456");
        expect(AmountInputUtils.toDigits(0.07, 2)).toBe("7");
        expect(AmountInputUtils.toDigits(1234, 0)).toBe("1234");
    });

    it("round-trips a value that binary floating point cannot hold exactly", () => {
        for (const value of [12.3, 0.07, 1.1, 19.99, 1234.56, 0.29, 8.11]) {
            expect(AmountInputUtils.fromDigits(AmountInputUtils.toDigits(value, 2), 2), `${value}`).toBe(value);
        }
    });

    /**
     * The halfway cases are the whole reason the shift is done on the decimal spelling: multiplying by 100 puts
     * `1.005` at `100.49999999999999` and `8.115` at `811.4999999999999`, so a rounded product loses the penny
     * that the number the consumer actually wrote is entitled to.
     */
    it("rounds a halfway value up rather than on its binary approximation", () => {
        expect(AmountInputUtils.toDigits(1.005, 2)).toBe("101");
        expect(AmountInputUtils.toDigits(8.115, 2)).toBe("812");
        expect(AmountInputUtils.toDigits(2.675, 2)).toBe("268");
        expect(Math.round(1.005 * 100), "which is what multiplying would have given").toBe(100);
    });

    it("rounds a value carrying more precision than the field shows", () => {
        expect(AmountInputUtils.fromDigits(AmountInputUtils.toDigits(1.005, 2), 2)).toBe(1.01);
        expect(AmountInputUtils.fromDigits(AmountInputUtils.toDigits(1.004, 2), 2)).toBe(1);
        expect(AmountInputUtils.fromDigits(AmountInputUtils.toDigits(2.675, 2), 2)).toBe(2.68);
    });

    it("keeps a whole number whole, and a zero fraction from becoming a digit", () => {
        expect(AmountInputUtils.toDigits(5, 2)).toBe("500");
        expect(AmountInputUtils.toDigits(0, 2)).toBe("0");
        expect(AmountInputUtils.toDigits(1000000, 0)).toBe("1000000");
    });

    it("has no value for an empty digit run", () => {
        expect(AmountInputUtils.fromDigits("", 2)).toBe(undefined);
    });

    it("reads a digit run shorter than the fraction as a fraction of one", () => {
        expect(AmountInputUtils.fromDigits("7", 2)).toBe(0.07);
        expect(AmountInputUtils.fromDigits("70", 2)).toBe(0.7);
    });
});
