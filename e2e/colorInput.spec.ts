import { expect, test } from "@playwright/test";

import { clickIsAllowed, computedStyle, inputValue, readout, setColor, tabIndex, variant } from "./helpers";

const DEFAULT = `${variant("Default")} input`;
const SNAPPING = `${variant("Snapping setter")} input`;
const DISABLED = `${variant("Disabled")} input`;

test.beforeEach(async ({ page }) => {
    await page.goto("/color-input");
    await expect(page.locator("[data-variant]").first()).toBeVisible();
});

test("the control is a real colour input the painter draws for", async ({ page }) => {
    await expect(page.locator(DEFAULT), "the control is a real colour input").toHaveAttribute("type", "color");
    expect(await inputValue(page.locator(DEFAULT)), "whose value is synced from the owner's signal").toBe("#3366ff");
    await expect(page.locator("input[disabled]"), "and none of them carries the native attribute").toHaveCount(0);

    expect(
        await computedStyle(page.locator(`${variant("Default")} [aria-hidden] > div`).first(), "background-color"),
        "the painter draws the swatch from the flags, since the native one is suppressed",
    ).toBe("rgb(51, 102, 255)");
});

test("a change reaches the owner and a snapping owner can rewrite it", async ({ page }) => {
    await setColor(page.locator(DEFAULT), "#00ff00");
    expect(await readout(page, "Default"), "a change reaches the owner's signal").toContain("value: #00ff00");

    await setColor(page.locator(SNAPPING), "#00d0b0");
    expect(await readout(page, "Snapping setter"), "a snapping owner can rewrite the value").toContain(
        "value: #00d1b2",
    );
    expect(
        await inputValue(page.locator(SNAPPING)),
        "and the input is resynced rather than left holding what the picker reported",
    ).toBe("#00d1b2");
});

test("a disabled field cancels the click that would open the OS picker", async ({ page }) => {
    await expect(page.locator(DISABLED), "a disabled field says so through ARIA").toHaveAttribute(
        "aria-disabled",
        "true",
    );
    expect(await tabIndex(page.locator(DISABLED)), "and is out of the tab order").toBe(-1);

    expect(
        await clickIsAllowed(page.locator(DISABLED)),
        "and the click that would open the OS picker is cancelled",
    ).toBe(false);
});
