import { expect, test } from "@playwright/test";

import { demo, inlineStyle } from "./helpers";

const bar = (key: string) => `${demo(key)} [role="progressbar"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/progress");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("a determinate bar carries its value and both ends of its range", async ({ page }) => {
    await expect(page.locator(bar("determinate")), "a value reaches aria-valuenow").toHaveAttribute(
        "aria-valuenow",
        "0.4",
    );
    await expect(page.locator(bar("determinate")), "with both ends of the range").toHaveAttribute("aria-valuemin", "0");
    await expect(page.locator(bar("determinate")), "stated explicitly").toHaveAttribute("aria-valuemax", "1");
    await expect(page.locator(bar("determinate")), "and a name of its own").toHaveAttribute(
        "aria-label",
        "Setup progress",
    );
});

test("an absent value is how ARIA spells indeterminate", async ({ page }) => {
    await expect(
        page.locator(bar("indeterminate")),
        "an absent value omits aria-valuenow, which is how ARIA spells indeterminate",
    ).not.toHaveAttribute("aria-valuenow");
    await expect(page.locator(bar("indeterminate")), "while the range it would fill is still declared").toHaveAttribute(
        "aria-valuemin",
        "0",
    );
});

test("a real unit range reaches ARIA unscaled, with a readable text", async ({ page }) => {
    await expect(page.locator(bar("liveRange")), "a real unit range reaches ARIA unscaled").toHaveAttribute(
        "aria-valuemax",
        "2400000",
    );
    await expect(
        page.locator(bar("liveRange")),
        "and aria-valuetext carries the reading a bare number cannot give",
    ).toHaveAttribute("aria-valuetext", /^\d+ of 2400 kB$/);
});

test("a value past the end is clamped for the painter but reported as given", async ({ page }) => {
    expect(
        await inlineStyle(page.locator(`${bar("outOfRange")} > div > div > div`), "width"),
        "a value past the end reaches the painter as a clamped ratio, not as 5",
    ).toBe("100%");
    await expect(
        page.locator(bar("outOfRange")),
        "though ARIA still reports what the owner actually said",
    ).toHaveAttribute("aria-valuenow", "5");
});

test("an errored bar is announced invalid", async ({ page }) => {
    await expect(page.locator(bar("errored")), "an errored bar is announced invalid").toHaveAttribute(
        "aria-invalid",
        "true",
    );
});

test("the filling variant is wider than the fit-content one", async ({ page }) => {
    const fitWidth = await page.locator(bar("determinate")).evaluate((element) => (element as HTMLElement).offsetWidth);
    const fillWidth = await page
        .locator(bar("fillingContainer"))
        .evaluate((element) => (element as HTMLElement).offsetWidth);

    expect(fillWidth > fitWidth, "the fill sizing is wider than fit-content, so the variant does something").toBe(true);
});
