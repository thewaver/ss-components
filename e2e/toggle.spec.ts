import { expect, test } from "@playwright/test";

import { demo, isIndeterminate } from "./helpers";

const DEFAULT = `${demo("default")} input`;
const SUMMARY = "#allSettings";
const FIRST_SETTING = "#firstSetting";

test.beforeEach(async ({ page }) => {
    await page.goto("/toggle");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("a plain toggle is a switch over a native checkbox", async ({ page }) => {
    await expect(page.locator(DEFAULT), "a plain toggle announces as a switch").toHaveAttribute("role", "switch");
    await expect(page.locator(DEFAULT), "over a native checkbox input").toHaveAttribute("type", "checkbox");
});

test("a mixed toggle drops the switch role and takes it back", async ({ page }) => {
    await expect(
        page.locator(SUMMARY),
        'a mixed toggle drops role="switch", which ARIA gives no mixed state',
    ).not.toHaveAttribute("role");
    expect(await isIndeterminate(page.locator(SUMMARY)), "and falls back to a mixed native checkbox").toBe(true);

    await page.locator(SUMMARY).click();
    await expect(
        page.locator(SUMMARY),
        "resolving the mixed state hands the switch role straight back",
    ).toHaveAttribute("role", "switch");

    await page.locator(FIRST_SETTING).click();
    await expect(page.locator(SUMMARY), "and going mixed again takes it away").not.toHaveAttribute("role");
});
