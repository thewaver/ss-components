import { describe, expect, it } from "vitest";

import type { TextSyncGroupDefs } from "./TextSync.utils";
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

/**
 * The grouped mask is the same digits-only contract anchored at the other end: the group count grows with the
 * value, so what survives an edit is how many digits _follow_ the caret rather than how many precede it. These
 * drive the caret explicitly, because that arithmetic is the whole of what is new here.
 */
const MONEY: TextSyncGroupDefs = { groupSize: 3, groupSeparator: ",", decimalSeparator: ".", decimals: 2 };
const PLAIN: TextSyncGroupDefs = { groupSize: 3, groupSeparator: " ", decimalSeparator: ".", decimals: 0 };

const typeGrouped = (defs: TextSyncGroupDefs, keys: string) => {
    let text = "";
    let caret = 0;

    for (const key of keys) {
        const next = text.slice(0, caret) + key + text.slice(caret);
        const result = TextSyncUtils.applyGroupedMask(defs, text, next, caret + 1);

        text = result.text;
        caret = result.caret;
    }

    return { text, caret };
};

describe("applyGroupedMask", () => {
    it("fills a fixed fraction from the right as digits arrive", () => {
        expect(typeGrouped(MONEY, "1").text).toBe("0.01");
        expect(typeGrouped(MONEY, "12").text).toBe("0.12");
        expect(typeGrouped(MONEY, "123").text).toBe("1.23");
        expect(typeGrouped(MONEY, "123456").text).toBe("1,234.56");
    });

    it("grows a group every three whole digits, which is what a fixed pattern cannot do", () => {
        expect(typeGrouped(PLAIN, "1").text).toBe("1");
        expect(typeGrouped(PLAIN, "1234").text).toBe("1 234");
        expect(typeGrouped(PLAIN, "1234567").text).toBe("1 234 567");
        expect(typeGrouped(PLAIN, "1234567890").text).toBe("1 234 567 890");
    });

    it("leaves the caret after the digit that was just typed, however the separators moved", () => {
        expect(typeGrouped(MONEY, "123456")).toEqual({ text: "1,234.56", caret: 8 });
        expect(typeGrouped(PLAIN, "1234")).toEqual({ text: "1 234", caret: 5 });
    });

    it("keeps the digits that follow the caret when one is inserted in the middle", () => {
        const result = TextSyncUtils.applyGroupedMask(MONEY, "1,234.56", "1,2934.56", 4);

        expect(result.text).toBe("12,934.56");
        expect(result.text.slice(result.caret), "four digits still follow the caret").toBe("34.56");
    });

    it("takes the digit before a separator when the separator is backspaced", () => {
        const result = TextSyncUtils.applyGroupedMask(MONEY, "1,234.56", "1234.56", 1);

        expect(result.text, "the comma cannot be deleted, so the 1 in front of it goes").toBe("234.56");
    });

    it("drops leading zeros rather than accumulating them", () => {
        expect(typeGrouped(MONEY, "000123").text).toBe("1.23");
        expect(typeGrouped(PLAIN, "0007").text).toBe("7");
    });

    it("is empty when nothing has been typed, rather than a bare separator", () => {
        expect(TextSyncUtils.applyGroupedMask(MONEY, "", "", 0)).toEqual({ text: "", caret: 0 });
        expect(TextSyncUtils.applyGroupedMask(MONEY, "0.01", "", 0)).toEqual({ text: "", caret: 0 });
    });

    it("ignores punctuation in a paste and keeps only the digits", () => {
        expect(TextSyncUtils.applyGroupedMask(MONEY, "", "1.234.567,89", 12).text).toBe("1,234,567.89");
    });
});

describe("formatWithGroups", () => {
    it("groups digits without a caret to preserve", () => {
        expect(TextSyncUtils.formatWithGroups(MONEY, "123456")).toBe("1,234.56");
        expect(TextSyncUtils.formatWithGroups(PLAIN, "1234567")).toBe("1 234 567");
        expect(TextSyncUtils.formatWithGroups(MONEY, "")).toBe("");
    });
});
