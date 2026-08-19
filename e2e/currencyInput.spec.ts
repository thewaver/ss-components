import { expect, test } from "@playwright/test";

import { demo, inputValue, prop, readout } from "./helpers";

const DEFAULT = demo("default");
const EMPTY = demo("empty");
const BOUNDED = demo("bounded");
const BIG = demo("big");

const field = (scope: string) => `${scope} input`;
const option = '[role="listbox"] [role="option"]';

const chooseProp = async (page: import("@playwright/test").Page, key: string, text: string) => {
    await page.locator(`${prop(key)} [role="combobox"]`).click();
    await page.locator(option, { hasText: text }).first().click();
};

/**
 * Typing is driven key by key rather than filled, because the whole of what is interesting here happens
 * between keystrokes: the group separators move as the value grows, and the caret has to stay after the digit
 * that was just pressed rather than where the browser left it.
 */
const typeInto = async (page: import("@playwright/test").Page, selector: string, text: string) => {
    await page.locator(selector).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Delete");
    await page.keyboard.type(text, { delay: 15 });
};

test.beforeEach(async ({ page }) => {
    await page.goto("/currency-input");
    await expect(page.locator(field(DEFAULT))).toBeVisible();
});

test("fills the fraction from the right as digits arrive", async ({ page }) => {
    await typeInto(page, field(EMPTY), "1");
    expect(await inputValue(page.locator(field(EMPTY)))).toBe("0.01");

    await page.keyboard.type("2", { delay: 15 });
    expect(await inputValue(page.locator(field(EMPTY)))).toBe("0.12");

    await page.keyboard.type("3", { delay: 15 });
    expect(await inputValue(page.locator(field(EMPTY)))).toBe("1.23");

    expect(await readout(page, "empty"), "and the owner is given a number, not the text").toContain("value: 1.23");
});

test("grows a separator as the value crosses a group, which a fixed pattern cannot do", async ({ page }) => {
    await typeInto(page, field(EMPTY), "123456");

    expect(await inputValue(page.locator(field(EMPTY)))).toBe("1,234.56");

    await page.keyboard.type("7", { delay: 15 });

    expect(await inputValue(page.locator(field(EMPTY))), "a second group appears rather than a slot filling").toBe(
        "12,345.67",
    );
});

test("keeps the caret after the digit that was typed, however the separators moved", async ({ page }) => {
    await typeInto(page, field(EMPTY), "1234");

    const caret = await page.locator(field(EMPTY)).evaluate((element) => (element as HTMLInputElement).selectionStart);

    expect(await inputValue(page.locator(field(EMPTY)))).toBe("12.34");
    expect(caret, "at the end, so the next digit lands where it looks like it will").toBe(5);
});

test("takes the digit with the separator when the separator is backspaced", async ({ page }) => {
    await typeInto(page, field(EMPTY), "123456");
    await page.locator(field(EMPTY)).evaluate((element) => (element as HTMLInputElement).setSelectionRange(2, 2));
    await page.keyboard.press("Backspace");

    expect(await inputValue(page.locator(field(EMPTY))), "the comma cannot go, so the 1 in front of it does").toBe(
        "234.56",
    );
});

test("an emptied field has no value rather than a zero", async ({ page }) => {
    await typeInto(page, field(EMPTY), "123");
    expect(await readout(page, "empty")).toContain("value: 1.23");

    await page.locator(field(EMPTY)).press("ControlOrMeta+a");
    await page.locator(field(EMPTY)).press("Delete");

    expect(await inputValue(page.locator(field(EMPTY)))).toBe("");
    expect(await readout(page, "empty"), "an empty field is not worth nothing, it holds nothing").toContain(
        "value: none",
    );
});

test("a bound refuses a value as it is typed rather than nudging it", async ({ page }) => {
    await typeInto(page, field(BOUNDED), "600000");

    expect(await inputValue(page.locator(field(BOUNDED))), "the text is what was typed").toBe("6,000.00");
    expect(await readout(page, "bounded"), "but a value over the maximum is not a value").toContain("value: none");

    await typeInto(page, field(BOUNDED), "400000");

    expect(await readout(page, "bounded"), "and one inside it is").toContain("value: 4000");
});

test("reads a pasted amount in punctuation it does not use", async ({ page }) => {
    await page.locator(field(EMPTY)).click();
    await page.keyboard.press("ControlOrMeta+a");
    await page.locator(field(EMPTY)).fill("1.234.567,89");

    expect(await inputValue(page.locator(field(EMPTY))), "only the digits carry meaning").toBe("1,234,567.89");
});

test("shows many groups for a large value", async ({ page }) => {
    expect(await inputValue(page.locator(field(BIG)))).toBe("9,876,543,210.12");
});

test.describe("the locale owns the separators", () => {
    test("swaps both of them for a locale that writes numbers the other way round", async ({ page }) => {
        expect(await inputValue(page.locator(field(DEFAULT)))).toBe("1,234.56");

        await chooseProp(page, "locale", "de-DE");

        expect(await inputValue(page.locator(field(DEFAULT))), "the group and decimal marks trade places").toBe(
            "1.234,56",
        );
        expect(await readout(page, "default"), "and the value itself has not moved").toContain("value: 1234.56");
    });

    test("a different decimal count re-reads the same digits", async ({ page }) => {
        await chooseProp(page, "decimals", "0");

        expect(await inputValue(page.locator(field(DEFAULT))), "no fraction, so every digit is a whole unit").toBe(
            "1,235",
        );
    });

    test("a different group size regroups without touching the value", async ({ page }) => {
        await chooseProp(page, "groupSize", "4");

        expect(await inputValue(page.locator(field(BIG)))).toBe("98,7654,3210.12");
        expect(await readout(page, "big")).toContain("value: 9876543210.12");
    });
});
