import { expect, test } from "@playwright/test";

import { activeText } from "./helpers";

/**
 * The Playground's own left menu is the only `Tabs` in the app, and it is a real one: `dir="column"`,
 * category headers that are disabled, and `href` on every navigable entry so each item is an `<a>`.
 */
const TAB = '[role="tab"]';

test.beforeEach(async ({ page }) => {
    await page.goto("/menu");
    await expect(page.locator(TAB).first()).toBeVisible();
});

test("a column tab list is one tab stop on the selected entry", async ({ page }) => {
    await expect(
        page.locator(`${TAB}[aria-disabled="true"]`),
        "the two category headers are the disabled entries",
    ).toHaveCount(2);
    await expect(page.locator(`${TAB}[tabindex="0"]`), "and exactly one tab holds the roving tab stop").toHaveCount(1);
    await expect(page.locator(`${TAB}[tabindex="0"]`), "which is the selected one").toHaveAttribute(
        "aria-selected",
        "true",
    );
});

test("the keyboard walks the column and skips the disabled headers", async ({ page }) => {
    await page.locator(`${TAB}[tabindex="0"]`).focus();
    expect(await activeText(page), "focus starts on the route's own tab").toBe("Menu");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "ArrowDown walks a column list forward").toBe("Modal");

    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    expect(await activeText(page), "and ArrowUp back past where it started").toBe("Label");

    await page.keyboard.press("ArrowRight");
    expect(
        await activeText(page),
        "while the cross-axis arrows do nothing, which is what the orientation option is for",
    ).toBe("Label");

    await page.keyboard.press("Home");
    expect(await activeText(page), "Home skips the disabled category above it").toBe("CellAnimation");

    await page.keyboard.press("End");
    expect(await activeText(page), "and End skips the one in the middle").toBe("Toggle");

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "the walk wraps from the last entry to the first").toBe("CellAnimation");

    await page.keyboard.press("ArrowUp");
    expect(await activeText(page), "and back the other way").toBe("Toggle");
});
