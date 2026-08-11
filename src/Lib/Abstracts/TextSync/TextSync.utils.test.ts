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
    it("emits a literal as soon as the digit before it has been typed", () => {
        const first = type("1", "2");

        expect(
            TextSyncUtils.applyMask(DATE, "1", first.next, first.caret).text,
            "a full group pulls its separator in, so the field says what it wants next",
        ).toBe("12/");

        const third = type("12/", "3");

        expect(TextSyncUtils.applyMask(DATE, "12/", third.next, third.caret).text).toBe("12/3");
    });

    it("stays empty until something is typed, so a leading literal never sits alone", () => {
        expect(TextSyncUtils.applyMask(DATE, "", "", 0).text).toBe("");
        expect(TextSyncUtils.applyMask("(###)", "", "", 0).text).toBe("");
    });

    it("puts the caret past a trailing literal, so the next digit lands where it looks like it will", () => {
        const second = type("1", "2");
        const filled = TextSyncUtils.applyMask(DATE, "1", second.next, second.caret);

        expect(filled.text).toBe("12/");
        expect(filled.caret, "after the slash rather than before it").toBe(3);

        const third = type("12/", "3");
        const result = TextSyncUtils.applyMask(DATE, "12/", third.next, third.caret);

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

    it("deletes a digit normally, and the separator before it stays put", () => {
        const result = TextSyncUtils.applyMask(DATE, "12/3", "12/", 3);

        expect(result.text, "the group in front of it is still full, so it still wants what comes next").toBe("12/");
        expect(result.caret).toBe(3);

        const again = TextSyncUtils.applyMask(DATE, "12/", "12", 2);

        expect(
            again.text,
            "backspacing the separator itself takes the digit before it, and the separator with it",
        ).toBe("1");
        expect(again.caret).toBe(1);
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

describe("readGroups", () => {
    it("reports the groups that are complete and stops at the one being typed", () => {
        expect(TextSyncUtils.readGroups("2026", [4, 2, 2]), "a year on its own").toEqual([2026]);
        expect(TextSyncUtils.readGroups("20261", [4, 2, 2]), "half a month is not a month yet").toEqual([2026]);
        expect(TextSyncUtils.readGroups("202613", [4, 2, 2]), "and reports as soon as it is one").toEqual([2026, 13]);
        expect(TextSyncUtils.readGroups("20261231", [4, 2, 2])).toEqual([2026, 12, 31]);
    });

    it("reads leading zeroes as the number they spell", () => {
        expect(TextSyncUtils.readGroups("0102", [2, 2])).toEqual([1, 2]);
        expect(TextSyncUtils.readGroups("0000", [4])).toEqual([0]);
    });

    it("reports nothing for an empty value, and ignores digits past the last group", () => {
        expect(TextSyncUtils.readGroups("", [2, 2])).toEqual([]);
        expect(TextSyncUtils.readGroups("1", [2])).toEqual([]);
        expect(TextSyncUtils.readGroups("123456", [2, 2])).toEqual([12, 34]);
    });
});

describe("formatWithMask", () => {
    it("lays already-ordered digits into the pattern", () => {
        expect(TextSyncUtils.formatWithMask(DATE, "25122026")).toBe("25/12/2026");
        expect(TextSyncUtils.formatWithMask(ISO, "20261231")).toBe("2026-12-31");
    });

    it("stops where the digits stop, carrying the separator the last full group earned", () => {
        expect(TextSyncUtils.formatWithMask(DATE, "2512")).toBe("25/12/");
        expect(TextSyncUtils.formatWithMask(DATE, "251")).toBe("25/1");
        expect(TextSyncUtils.formatWithMask(DATE, "")).toBe("");
    });
});
