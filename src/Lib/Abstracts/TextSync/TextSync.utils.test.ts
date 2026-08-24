import { describe, expect, it } from "vitest";

import type { TextSyncGroupDefs } from "./TextSync.utils";
import { TextSyncUtils } from "./TextSync.utils";

const DATE = "##/##/####";
const ISO = "####-##-##";

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

const MONEY: TextSyncGroupDefs = { groupSizes: [3], groupSeparator: ",", decimalSeparator: ".", decimals: 2 };
const PLAIN: TextSyncGroupDefs = { groupSizes: [3], groupSeparator: " ", decimalSeparator: ".", decimals: 0 };
const SIGNED: TextSyncGroupDefs = { ...MONEY, hasSign: true };
const LAKH: TextSyncGroupDefs = { ...PLAIN, groupSizes: [3, 2], groupSeparator: "," };
const UNGROUPED: TextSyncGroupDefs = { ...PLAIN, groupSizes: [] };

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

/**
 * The sizes are read from the decimal point outwards and the last one repeats, so `[3]` is every locale that
 * groups in threes and `[3, 2]` is the Indian grouping — three digits nearest the point, twos above it. An
 * empty list is the third reading of the same rule: there is no size to repeat, so nothing is grouped at all.
 */
describe("applyGroupedMask over a grouping that is not uniform", () => {
    it("repeats the last size rather than the first, so only the nearest group is three digits", () => {
        expect(typeGrouped(LAKH, "1234").text).toBe("1,234");
        expect(typeGrouped(LAKH, "12345").text).toBe("12,345");
        expect(typeGrouped(LAKH, "1234567").text).toBe("12,34,567");
        expect(typeGrouped(LAKH, "1234567890").text).toBe("1,23,45,67,890");
    });

    it("leaves the whole run alone when there is no size to repeat", () => {
        expect(typeGrouped(UNGROUPED, "1234567").text).toBe("1234567");
    });

    it("keeps the caret behind the digit just typed while the separators shift under it", () => {
        expect(typeGrouped(LAKH, "1234567")).toEqual({ text: "12,34,567", caret: 9 });
    });
});

/**
 * The separators already come from `Intl` rather than from a prop, on the grounds that a consumer who has
 * named their locale has answered the question. The grouping is the same question: `en-IN` writes its commas
 * every two digits above the first three, and a field that took the locale's comma and grouped in threes
 * anyway would be spelling the locale wrong in the one place it had been told what the locale is.
 */
describe("getGroupSizes", () => {
    it("reads threes for a locale that groups in threes", () => {
        expect(TextSyncUtils.getGroupSizes("en-GB")).toEqual([3]);
        expect(TextSyncUtils.getGroupSizes("de-DE")).toEqual([3]);
    });

    it("reads three then twos for the Indian grouping", () => {
        expect(TextSyncUtils.getGroupSizes("en-IN")).toEqual([3, 2]);
        expect(TextSyncUtils.getGroupSizes("hi-IN")).toEqual([3, 2]);
    });

    it("collapses the repeat rather than reporting one size per group the sample happened to have", () => {
        expect(TextSyncUtils.getGroupSizes("en-US").length).toBe(1);
    });
});

describe("formatWithGroups", () => {
    it("groups digits without a caret to preserve", () => {
        expect(TextSyncUtils.formatWithGroups(MONEY, "123456")).toBe("1,234.56");
        expect(TextSyncUtils.formatWithGroups(PLAIN, "1234567")).toBe("1 234 567");
        expect(TextSyncUtils.formatWithGroups(LAKH, "1234567")).toBe("12,34,567");
        expect(TextSyncUtils.formatWithGroups(MONEY, "")).toBe("");
    });
});

/**
 * The sign is opt-in because most masked fields cannot hold one: a date's ISO spelling already uses the hyphen
 * as a separator, so a mask that treated one as a sign would misread every date it was given.
 */
describe("applyGroupedMask with a sign", () => {
    it("keeps a minus in front of the grouped amount", () => {
        expect(typeGrouped(SIGNED, "-123456").text).toBe("-1,234.56");
    });

    it("holds a lone minus, so the sign can be typed before the digits", () => {
        expect(typeGrouped(SIGNED, "-")).toEqual({ text: "-", caret: 1 });
    });

    it("takes the minus wherever it is typed and leaves the digits alone, because a sign has one place", () => {
        expect(typeGrouped(SIGNED, "12-34").text).toBe("-12.34");
    });

    it("drops the sign entirely when the field is not signed", () => {
        expect(typeGrouped(MONEY, "-123456").text).toBe("1,234.56");
        expect(typeGrouped(MONEY, "-")).toEqual({ text: "", caret: 0 });
    });

    it("puts the caret after the sign rather than before it once digits arrive", () => {
        const result = typeGrouped(SIGNED, "-1");

        expect(result.text).toBe("-0.01");
        expect(result.caret).toBe(result.text.length);
    });
});

describe("formatWithGroups with a sign", () => {
    it("round-trips a signed run of digits", () => {
        expect(TextSyncUtils.formatWithGroups(SIGNED, "-123456")).toBe("-1,234.56");
        expect(TextSyncUtils.formatWithGroups(SIGNED, "123456")).toBe("1,234.56");
    });

    it("ignores a sign the defs did not ask for", () => {
        expect(TextSyncUtils.formatWithGroups(MONEY, "-123456")).toBe("1,234.56");
    });
});

describe("readSignedDigits", () => {
    it("keeps the sign and drops everything else that is not a digit", () => {
        expect(TextSyncUtils.readSignedDigits("-1,234.56")).toBe("-123456");
        expect(TextSyncUtils.readSignedDigits("1,234.56")).toBe("123456");
    });
});
