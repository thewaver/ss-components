import { expect, test } from "@playwright/test";

import { demo, readout } from "./helpers";

const PICKED = demo("picked");
const BOUNDED = demo("bounded");

/**
 * Both fields belong to the one picker, so they are found by position within it rather than by label — the
 * labels are editorial, and the thing being asserted is that the first field is the start and the second the
 * end, which is a structural claim.
 */
const field = (scope: string, index: number) => `${scope} input >> nth=${index}`;

/**
 * The fields take ISO digits, which is `DateInput`'s default format, and the mask inserts the separators —
 * so a spec types eight digits and reads back a formatted string.
 */
const typeInto = async (page: import("@playwright/test").Page, selector: string, digits: string) => {
    await page.locator(selector).click();
    await page.keyboard.type(digits, { delay: 15 });
};

test.beforeEach(async ({ page }) => {
    await page.goto("/date-range-picker");
    await expect(page.locator(field(PICKED, 0))).toBeVisible();
});

/**
 * The decision this component exists to carry: the consumer holds one signal. So a start on its own is not a
 * value, however complete that field looks on screen — which is the difference between this and two date
 * fields a consumer wires together, where a half-filled pair is something the consumer has to handle.
 */
test("a start on its own is a filled field but not a value", async ({ page }) => {
    await typeInto(page, field(PICKED, 0), "20260810");

    await expect(page.locator(field(PICKED, 0)), "the field shows what was typed").toHaveValue("2026-08-10");

    await expect
        .poll(() => readout(page, "picked"), { message: "but half a range is not reported outwards" })
        .toContain("none");
});

test("filling both fields reports the pair as one value", async ({ page }) => {
    await typeInto(page, field(PICKED, 0), "20260810");
    await typeInto(page, field(PICKED, 1), "20260814");

    await expect
        .poll(() => readout(page, "picked"), { message: "the two fields resolve to a single { start, end }" })
        .toContain("2026-08-10 to 2026-08-14");
});

/**
 * Typing the later date into the start field is the case a consumer reaches by editing an existing range.
 * The value is ordered on the way out, so the pair is a span rather than a record of which box was typed in.
 */
test("the ends are ordered on the way out, whichever field holds the later date", async ({ page }) => {
    await typeInto(page, field(PICKED, 0), "20260814");
    await typeInto(page, field(PICKED, 1), "20260810");

    await expect.poll(() => readout(page, "picked")).toContain("2026-08-10 to 2026-08-14");
});

test("clearing one field clears the value, because the pair is one value", async ({ page }) => {
    await typeInto(page, field(PICKED, 0), "20260810");
    await typeInto(page, field(PICKED, 1), "20260814");

    await expect.poll(() => readout(page, "picked")).toContain("2026-08-10 to 2026-08-14");

    await page.locator(field(PICKED, 1)).fill("");
    await page.locator(field(PICKED, 1)).blur();

    await expect
        .poll(() => readout(page, "picked"), { message: "half a range is not a range on the way back down either" })
        .toContain("none");
});

/**
 * The calendar in the popup and the two fields are two ways into the same signal, so a span picked in the
 * grid has to arrive in the fields. This is the pairing that would break first if the value were two signals.
 */
test("a span picked in the calendar fills both fields", async ({ page }) => {
    await page.locator(`${PICKED} button`).last().click();

    const grid = page.locator('[role="dialog"] [role="grid"]');

    await expect(grid).toBeVisible();

    await grid.locator('[role="gridcell"][aria-label="10 August 2026"]').click();
    await grid.locator('[role="gridcell"][aria-label="14 August 2026"]').click();

    await expect(page.locator(field(PICKED, 0)), "the start field takes the earlier end").toHaveValue("2026-08-10");
    await expect(page.locator(field(PICKED, 1)), "and the end field takes the later one").toHaveValue("2026-08-14");
});

test("a bounded picker refuses a day outside its range", async ({ page }) => {
    await page.locator(`${BOUNDED} button`).last().click();

    const grid = page.locator('[role="dialog"] [role="grid"]');

    await expect(grid).toBeVisible();

    await grid.locator('[role="gridcell"][aria-label="1 August 2026"]').dispatchEvent("click");

    await expect
        .poll(() => readout(page, "bounded"), { message: "a day before the minimum starts nothing" })
        .toContain("none");
});
