import { expect, test } from "@playwright/test";

import { computedStyle, demo, inputValue, isReadOnly, isScrolling, offsetHeight, readout, tagName } from "./helpers";

const FIXED = `${demo("fixedHeight")} textarea`;
const GROWING = `${demo("autoSizing")} textarea`;
const CAPPED = `${demo("autoSizingCapped")} textarea`;
const READ_ONLY = `${demo("readOnly")} textarea`;
const DISABLED = `${demo("disabled")} textarea`;

const THREE_LINES = "one\ntwo\nthree";

test.beforeEach(async ({ page }) => {
    await page.goto("/text-area");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the control is a textarea rather than an input with a type", async ({ page }) => {
    expect(await tagName(page.locator(FIXED)), "a textarea is a different element, not a different type").toBe(
        "TEXTAREA",
    );
    await expect(page.locator(FIXED), "and carries no type attribute").not.toHaveAttribute("type");
});

test("the drag handle is off, because the painter owns the box", async ({ page }) => {
    expect(
        await computedStyle(page.locator(FIXED), "resize"),
        "a user-dragged element would leave the painted frame behind",
    ).toBe("none");
});

test("typing reports each keystroke across lines", async ({ page }) => {
    await page.locator(FIXED).focus();
    await page.keyboard.type(THREE_LINES);
    expect(await inputValue(page.locator(FIXED)), "a newline is a value like any other").toBe(THREE_LINES);
    expect(await readout(page, "fixedHeight"), "and every keystroke is reported").toContain(
        `length: ${THREE_LINES.length}`,
    );
});

test("a fixed field keeps the height its painter drew", async ({ page }) => {
    const before = await offsetHeight(page.locator(FIXED));

    await page.locator(FIXED).focus();
    await page.keyboard.type(THREE_LINES);
    expect(await offsetHeight(page.locator(FIXED)), "nothing measures, so nothing moves").toBe(before);
    expect(await isScrolling(page.locator(FIXED)), "a fixed field scrolls its own content instead").toBe(false);
});

test("an auto-sizing field grows with what is typed and shrinks back", async ({ page }) => {
    const empty = await offsetHeight(page.locator(GROWING));

    await page.locator(GROWING).focus();
    await page.keyboard.type(THREE_LINES);

    const grown = await offsetHeight(page.locator(GROWING));

    expect(grown, "three lines need more room than the two it starts at").toBeGreaterThan(empty);
    expect(await isScrolling(page.locator(GROWING)), "and it grew instead of scrolling").toBe(false);

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace");
    expect(await offsetHeight(page.locator(GROWING)), "emptying it returns to the row floor").toBe(empty);
});

test("a capped field stops growing and scrolls from there", async ({ page }) => {
    const before = await offsetHeight(page.locator(CAPPED));

    await page.locator(CAPPED).focus();
    await page.keyboard.press("Control+End");
    await page.keyboard.type("\nfour\nfive\nsix\nseven\neight\nnine\nten");

    const grown = await offsetHeight(page.locator(CAPPED));

    expect(grown, "it grew").toBeGreaterThan(before);
    expect(await isScrolling(page.locator(CAPPED)), "then hit the ceiling and started scrolling instead").toBe(true);

    await page.keyboard.type("\neleven\ntwelve");
    expect(await offsetHeight(page.locator(CAPPED)), "and stays there however much more arrives").toBe(grown);
});

test("a read-only field refuses a keystroke and a paste alike", async ({ page }) => {
    expect(await isReadOnly(page.locator(READ_ONLY)), "a read-only field is readonly").toBe(true);
    await expect(page.locator(READ_ONLY), "and says so").toHaveAttribute("aria-readonly", "true");

    const before = await inputValue(page.locator(READ_ONLY));

    await page.locator(READ_ONLY).focus();
    await page.keyboard.type("x");
    await page.keyboard.insertText("pasted");
    expect(await inputValue(page.locator(READ_ONLY)), "and takes neither").toBe(before);
});

test("a disabled field uses no native disabled attribute and suppresses its caret", async ({ page }) => {
    await expect(page.locator("textarea[disabled]"), "no field carries the native disabled attribute").toHaveCount(0);
    await expect(page.locator(DISABLED), "while ARIA carries the disabled meaning").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    expect(
        await computedStyle(page.locator(DISABLED), "caret-color"),
        "and the caret is suppressed, so a focusable disabled field does not invite typing",
    ).toBe("rgba(0, 0, 0, 0)");
});
