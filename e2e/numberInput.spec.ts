import { expect, test } from "@playwright/test";

import { accessibleText, demo, inputValue, isReadOnly, readout } from "./helpers";

const DEFAULT = `${demo("default")} input`;
const QUANTITY = `${demo("steppedClamped")} input`;
const QUANTITY_UP = `${demo("steppedClamped")} button:has-text("Increase")`;
const QUANTITY_DOWN = `${demo("steppedClamped")} button:has-text("Decrease")`;
const RATING = `${demo("fractionalStep")} input`;
const READ_ONLY = `${demo("readOnly")} input`;
const READ_ONLY_UP = `${demo("readOnly")} button:has-text("Increase")`;
const DISABLED = `${demo("disabled")} input`;

test.beforeEach(async ({ page }) => {
    await page.goto("/number-input");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the field is a text input announcing itself as a spin button", async ({ page }) => {
    await expect(page.locator(QUANTITY), "the element is text, so no value is ever sanitised away").toHaveAttribute(
        "type",
        "text",
    );
    await expect(page.locator(QUANTITY), "while ARIA carries the spinning meaning").toHaveAttribute(
        "role",
        "spinbutton",
    );
    await expect(page.locator(QUANTITY), "with the range it can hold").toHaveAttribute("aria-valuemin", "0");
    await expect(page.locator(QUANTITY), "at both ends").toHaveAttribute("aria-valuemax", "100");
    await expect(page.locator(QUANTITY), "and the value it holds now").toHaveAttribute("aria-valuenow", "13");
});

test("the stepper buttons carry a readable name rather than a glyph", async ({ page }) => {
    expect(
        await accessibleText(page.locator(QUANTITY_UP)),
        "the triangle is decoration, so the name has to come from somewhere else",
    ).toBe("Increase");
});

test("a click steps to the next rung of the ladder", async ({ page }) => {
    await page.locator(QUANTITY_UP).click();
    expect(await readout(page, "steppedClamped"), "13 is between rungs, so up snaps to 15").toContain("value: 15");

    await page.locator(QUANTITY_UP).click();
    expect(await readout(page, "steppedClamped"), "and a rung then moves a whole step").toContain("value: 20");

    await page.locator(QUANTITY_DOWN).click();
    expect(await readout(page, "steppedClamped"), "down moves back the same way").toContain("value: 15");
});

test("the arrows step and Home and End reach the ends", async ({ page }) => {
    await page.locator(QUANTITY).focus();
    await page.keyboard.press("ArrowUp");
    expect(await readout(page, "steppedClamped"), "an arrow steps like a click does").toContain("value: 15");

    await page.keyboard.press("End");
    expect(await readout(page, "steppedClamped"), "End reaches the top of the range").toContain("value: 100");

    await page.keyboard.press("Home");
    expect(await readout(page, "steppedClamped"), "and Home the bottom").toContain("value: 0");
});

test("a fractional step does not drift", async ({ page }) => {
    await page.locator(RATING).focus();
    await page.keyboard.press("ArrowUp");
    expect(await inputValue(page.locator(RATING)), "a tenth added to 3.7 is 3.8 and nothing longer").toBe("3.8");
});

test("the stepper stops at the ends of the range", async ({ page }) => {
    await page.locator(QUANTITY).focus();
    await page.keyboard.press("End");
    await expect(page.locator(QUANTITY_UP), "at the top there is nowhere further up to go").toHaveAttribute(
        "aria-disabled",
        "true",
    );

    await page.keyboard.press("Home");
    await expect(page.locator(QUANTITY_DOWN), "and the same at the bottom").toHaveAttribute("aria-disabled", "true");
});

test("typing refuses what cannot appear in a number and keeps what is half typed", async ({ page }) => {
    await page.locator(DEFAULT).focus();
    await page.keyboard.type("12ab3");
    expect(await inputValue(page.locator(DEFAULT)), "letters never land").toBe("123");

    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await page.keyboard.type("-1.");
    expect(await inputValue(page.locator(DEFAULT)), "a half-typed value stays typeable").toBe("-1.");
    expect(await readout(page, "default"), "and reads back as the number it already is").toContain("value: -1");
});

test("an empty field has no value rather than zero", async ({ page }) => {
    await page.locator(DEFAULT).focus();
    await page.keyboard.type("5");
    await page.keyboard.press("Backspace");
    expect(await readout(page, "default"), "an emptied field reports no value at all").toContain("value: undefined");
});

test("a typed value is clamped when the field is left, not while it is typed", async ({ page }) => {
    await page.locator(QUANTITY).focus();
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.type("999");
    expect(
        await inputValue(page.locator(QUANTITY)),
        "clamping per keystroke would make the second digit untypeable",
    ).toBe("999");

    await page.locator(DEFAULT).focus();
    expect(await inputValue(page.locator(QUANTITY)), "leaving the field is when it is brought into range").toBe("100");
    expect(await readout(page, "steppedClamped"), "and the owner is told").toContain("value: 100");
});

test("a read-only field refuses every way of moving the value", async ({ page }) => {
    expect(await isReadOnly(page.locator(READ_ONLY)), "a read-only field is readonly").toBe(true);
    await expect(page.locator(READ_ONLY_UP), "and its stepper is unavailable with it").toHaveAttribute(
        "aria-disabled",
        "true",
    );

    const before = await inputValue(page.locator(READ_ONLY));

    await page.locator(READ_ONLY).focus();
    await page.keyboard.press("ArrowUp");
    expect(await inputValue(page.locator(READ_ONLY)), "so the arrows move nothing either").toBe(before);
});

test("a disabled field uses no native disabled attribute and takes nothing", async ({ page }) => {
    await expect(page.locator("input[disabled]"), "no field carries the native disabled attribute").toHaveCount(0);

    const before = await inputValue(page.locator(DISABLED));

    await page.locator(DISABLED).focus();
    await page.keyboard.press("ArrowUp");
    expect(await inputValue(page.locator(DISABLED)), "a disabled field takes nothing").toBe(before);
});

/**
 * Holding the stepper repeats, which is what a native spinner does and what this one could not do until
 * `Button` reported the pointer going down. A tap has to stay a single step, so both halves are asserted:
 * the repeat only starts after the delay, and releasing stops it.
 */
test("holding a stepper repeats, and a tap does not", async ({ page }) => {
    const readValue = async () => Number(/value: (\d+)/.exec(await readout(page, "steppedClamped"))?.[1]);

    const box = (await page.locator(QUANTITY_UP).boundingBox())!;

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.mouse.down();
    await page.mouse.up();

    const afterTap = await readValue();

    await page.mouse.down();
    await page.waitForTimeout(1000);
    await page.mouse.up();

    const afterHold = await readValue();

    expect(afterHold, "holding steps repeatedly rather than once").toBeGreaterThan(afterTap + 1);

    await page.waitForTimeout(300);

    expect(await readValue(), "and releasing stops it").toBe(afterHold);
});
