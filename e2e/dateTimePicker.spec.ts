import { expect, test } from "@playwright/test";

import { demo, readout } from "./helpers";

const PAIRED = demo("paired");
const SEEDED = demo("seeded");
const PICKED = demo("picked");

/**
 * The two fields are the existing `DateInput` and `TimeInput`, side by side and in that order, so they are
 * found by position: the claim under test is that both are driven by one value, not that either is labelled
 * a particular way.
 */
const field = (scope: string, index: number) => `${scope} input >> nth=${index}`;

/**
 * A field is cleared before it is typed into, because a field that already holds a value would otherwise take
 * the digits at whatever position the caret happened to be, rather than replacing what is there.
 */
const typeInto = async (page: import("@playwright/test").Page, selector: string, digits: string) => {
    await page.locator(selector).fill("");
    await page.locator(selector).click();
    await page.keyboard.type(digits, { delay: 15 });
};

test.beforeEach(async ({ page }) => {
    await page.goto("/date-time-picker");
    await expect(page.locator(field(PAIRED, 0))).toBeVisible();
});

/**
 * The decision behind this: one signal owns the pair, and a pair with a half missing is not a value. That is
 * the same rule the range calendar follows, and it is the difference from two signals, where the consumer
 * would be holding a date and an absent time and deciding for itself what that combination meant.
 */
test("one half on its own is not a value", async ({ page }) => {
    await typeInto(page, field(PAIRED, 0), "20260810");

    await expect
        .poll(() => readout(page, "paired"), { message: "a date without a time is not a date-time" })
        .toContain("none");
});

test("the two halves land in one value rather than two", async ({ page }) => {
    await typeInto(page, field(PAIRED, 0), "20260810");
    await typeInto(page, field(PAIRED, 1), "0930");

    await expect.poll(() => readout(page, "paired")).toContain("2026-08-10 at 09:30");
});

/**
 * Writing one half must not disturb the other, which is the whole job of the split: the date field's setter
 * rebuilds the pair rather than replacing it.
 */
test("editing one half leaves the other where it was", async ({ page }) => {
    await typeInto(page, field(PAIRED, 0), "20260810");
    await typeInto(page, field(PAIRED, 1), "0930");
    await typeInto(page, field(PAIRED, 0), "20260814");

    await expect
        .poll(() => readout(page, "paired"), { message: "the time survives a change of date" })
        .toContain("2026-08-14 at 09:30");
});

test("an existing value shows up in both fields at once", async ({ page }) => {
    await expect(page.locator(field(SEEDED, 0)), "the date half reaches the date field").toHaveValue("2026-08-10");
    await expect(page.locator(field(SEEDED, 1)), "and the time half reaches the time field").toHaveValue("12:00");

    await expect
        .poll(() => readout(page, "seeded"), { message: "and the pair reads as one value" })
        .toContain("2026-08-10 at 12:00");
});

/**
 * Clearing either field clears the whole value. That is the honest reading of a pair held as one value: there
 * is no state in which the value exists with half of it missing, so the alternative would be inventing one.
 */
test("clearing one half clears the value, because there is no half a value", async ({ page }) => {
    await page.locator(field(SEEDED, 0)).fill("");
    await page.locator(field(SEEDED, 0)).blur();

    await expect.poll(() => readout(page, "seeded")).toContain("none");
});

/**
 * `DateTimePicker` is the control over the same value: two fields, each with its own popup, and one signal
 * underneath. These check the seam rather than the two pickers, which have their own specs — that both
 * popups write into the one value, and that neither half alone amounts to one.
 */
test("the calendar fills only the date half, so the value is still incomplete", async ({ page }) => {
    await page.locator(`${PICKED} button`).first().click();

    const dialog = page.locator('[role="dialog"]');

    await expect(dialog).toBeVisible();

    await dialog.locator('[role="gridcell"][aria-label="10 August 2026"]').click();

    await expect(page.locator(`${PICKED} input`).first(), "the date field takes the pick").toHaveValue("2026-08-10");

    await expect
        .poll(() => readout(page, "picked"), { message: "but a date without a time is not a date-time" })
        .toContain("none");
});

test("the clock completes the value the calendar started", async ({ page }) => {
    await page.locator(`${PICKED} button`).first().click();

    const dialog = page.locator('[role="dialog"]');

    await dialog.locator('[role="gridcell"][aria-label="10 August 2026"]').click();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.locator(`${PICKED} button`).last().click();
    await expect(dialog).toBeVisible();

    await dialog.locator('[role="option"]').filter({ hasText: /^09$/ }).first().click();

    await expect
        .poll(() => readout(page, "picked"), { message: "both popups write into the one value" })
        .toContain("2026-08-10 at 09");
});

test("the two popups are separate layers, so opening one closes nothing of the other's", async ({ page }) => {
    const dialog = page.locator('[role="dialog"]');

    await page.locator(`${PICKED} button`).first().click();

    await expect(dialog.locator('[role="grid"]'), "the calendar is the open layer").toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.locator(`${PICKED} button`).last().click();

    await expect(dialog.locator('[role="option"]').first(), "and the clock is the next one").toBeVisible();
    await expect(dialog.locator('[role="grid"]'), "with no calendar left behind it").toHaveCount(0);
});
