import { describe, expect, it } from "vitest";

import { TextSyncUtils } from "./TextSync.utils";

const DATE = "##/##/####";
const ISO = "####-##-##";

/** What the element would hold after a keystroke: the previous text with something typed into it. */
const type = (previous: string, char: string, caret = previous.length) => ({
    next: `${previous.slice(0, caret)}${char}${previous.slice(caret)}`,
    caret: caret + char.length,
});

describe("applyMask", () => {
    it("emits a literal only once the digit after it has been typed", () => {
        const first = type("1", "2");

        expect(TextSyncUtils.applyMask(DATE, "1", first.next, first.caret).text, "two digits stop at the digits").toBe(
            "12",
        );

        const third = type("12", "3");

        expect(
            TextSyncUtils.applyMask(DATE, "12", third.next, third.caret).text,
            "the separator arrives with the digit that follows it",
        ).toBe("12/3");
    });

    it("puts the caret after the digit just typed, past any literal it pulled in", () => {
        const third = type("12", "3");
        const result = TextSyncUtils.applyMask(DATE, "12", third.next, third.caret);

        expect(result.caret, "the caret is after the 3, which is offset 4 in 12/3").toBe(4);
    });

    it("throws away everything that is not a digit, so a paste in any spelling lands the same value", () => {
        const expected = "25/12/2026";

        expect(TextSyncUtils.applyMask(DATE, "", "25122026", 8).text).toBe(expected);
        expect(TextSyncUtils.applyMask(DATE, "", "25/12/2026", 10).text).toBe(expected);
        expect(TextSyncUtils.applyMask(DATE, "", "25.12.2026", 10).text).toBe(expected);
        expect(TextSyncUtils.applyMask(DATE, "", "  25 12 2026 ", 13).text).toBe(expected);
    });

    it("ignores digits the pattern has no room for", () => {
        expect(TextSyncUtils.applyMask(DATE, "", "251220267", 9).text, "a ninth digit has nowhere to go").toBe(
            "25/12/2026",
        );
    });

    it("deletes the digit in front of a literal when the literal itself is deleted", () => {
        const result = TextSyncUtils.applyMask(DATE, "12/34", "1234", 2);

        expect(result.text, "backspacing the slash takes the 2 with it rather than doing nothing").toBe("13/4");
        expect(result.caret, "and the caret lands after the digit that survived").toBe(1);
    });

    it("deletes a digit normally, and lets the literal go with it", () => {
        const result = TextSyncUtils.applyMask(DATE, "12/3", "12/", 3);

        expect(result.text, "the separator has nothing after it, so it leaves too").toBe("12");
        expect(result.caret).toBe(2);
    });

    it("keeps the caret where the digits say when an edit happens in the middle", () => {
        const result = TextSyncUtils.applyMask(DATE, "25/12/2026", "259/12/2026", 3);

        expect(result.text, "the inserted digit pushes the rest along").toBe("25/91/2202");
        expect(result.caret, "and the caret stays after the digit that was typed").toBe(4);
    });

    it("emits leading literals as soon as there is a digit to justify them", () => {
        expect(TextSyncUtils.applyMask("(###)", "", "5", 1).text).toBe("(5");
    });

    it("reports an empty value with the caret at the start", () => {
        const result = TextSyncUtils.applyMask(DATE, "1", "", 0);

        expect(result.text).toBe("");
        expect(result.caret).toBe(0);
    });

    it("works the same for an ISO pattern, which has a wider first group", () => {
        expect(TextSyncUtils.applyMask(ISO, "", "20261231", 8).text).toBe("2026-12-31");
        expect(TextSyncUtils.applyMask(ISO, "", "2026-1", 6).text, "half a month is half a month").toBe("2026-1");
    });
});

describe("formatWithMask", () => {
    it("lays already-ordered digits into the pattern", () => {
        expect(TextSyncUtils.formatWithMask(DATE, "25122026")).toBe("25/12/2026");
        expect(TextSyncUtils.formatWithMask(ISO, "20261231")).toBe("2026-12-31");
    });

    it("stops where the digits stop, so a partial value formats partially", () => {
        expect(TextSyncUtils.formatWithMask(DATE, "2512")).toBe("25/12");
    });
});
