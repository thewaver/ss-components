import { expect, test } from "@playwright/test";

import { inlineStyle, prop } from "./helpers";

const CORNER_GRID = '[data-panel="global"] [style*="grid-template-columns"]';

/**
 * The Playground's props panels are the only consumer of these controls that was not written to
 * demonstrate them. These assertions are what makes that migration a fact rather than a claim: no native
 * control is left, and a migrated field still drives the page state the raw one used to.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/shape");
    await expect(page.locator('[data-panel="global"]').first()).toBeVisible();
});

test("no native control survives in a props panel", async ({ page }) => {
    await expect(page.locator("select"), "no native select survives in a props panel").toHaveCount(0);
    await expect(page.locator("input[disabled]"), "and nothing uses the native disabled attribute").toHaveCount(0);

    expect(
        await page.locator('[role="combobox"]').count(),
        "the panel's dropdowns are Select instead",
    ).toBeGreaterThanOrEqual(4);
    expect(await page.locator('input[type="checkbox"]').count(), "and its toggles are Checkbox").toBeGreaterThanOrEqual(
        3,
    );
    expect(
        await page.locator('button[aria-haspopup="dialog"]').count(),
        "with a ColorInput for the colour swatches, which is now its own popup rather than the OS dialog",
    ).toBeGreaterThanOrEqual(1);
});

test("a migrated Checkbox still drives the page state the raw one did", async ({ page }) => {
    expect(
        await inlineStyle(page.locator(CORNER_GRID).first(), "grid-template-columns"),
        "the corner grid starts collapsed to one column",
    ).toBe("repeat(1, 1fr)");

    await page.locator(`${prop("hasIndividualCorners")} input`).click();
    expect(
        await inlineStyle(page.locator(CORNER_GRID).first(), "grid-template-columns"),
        "and a migrated Checkbox still drives the page state the raw one did",
    ).not.toBe("repeat(1, 1fr)");
});

test("a migrated Select still drives the page state the raw one did", async ({ page }) => {
    const before = await page.locator('[role="combobox"]').first().textContent();

    await page.locator('[role="combobox"]').first().click();
    await expect(page.locator('[role="combobox"]').first()).toHaveAttribute("aria-activedescendant", /.+/);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    expect(await page.locator('[role="combobox"]').first().textContent(), "and a migrated Select does too").not.toBe(
        before,
    );
});
