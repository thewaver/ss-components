import { expect, test } from "@playwright/test";

import { demo } from "./helpers";

const ANCHOR = `${demo("decorated")} button`;
const OTHER = `${demo("default")} button`;
const TOOLTIP = '[role="tooltip"]';

/**
 * `Tooltip` has no page of its own — it only exists anchored to something — so it is driven through the
 * `Button` page, which is where both a plain tooltip and a disabled control's explanation live.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/button");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("nothing is announced before anything is hovered", async ({ page }) => {
    await expect(page.locator(TOOLTIP), "nothing is in the tree before anything is hovered").toHaveCount(0);
    await expect(page.locator(ANCHOR), "and the anchor claims no description it does not yet have").not.toHaveAttribute(
        "aria-describedby",
    );
});

test("hovering portals a tooltip and points the anchor at it", async ({ page }) => {
    await page.locator(ANCHOR).hover();

    await expect(page.locator(TOOLTIP), "hovering the anchor shows it").toBeVisible();
    expect(
        await page.evaluate(
            (selector) => !document.querySelector(selector)!.contains(document.querySelector('[role="tooltip"]')),
            ANCHOR,
        ),
        "portalled out of the anchor rather than nested inside it",
    ).toBe(true);
    expect(
        await page.evaluate((selector) => {
            const described = document.querySelector(selector)?.getAttribute("aria-describedby");
            const tooltip = document.querySelector('[role="tooltip"]');

            return !!described && !!tooltip && described.split(/\s+/).includes(tooltip.id);
        }, ANCHOR),
        "and pointed at by aria-describedby, which is how it is announced at all",
    ).toBe(true);
});

test("a top-out placement lands the whole tooltip above the anchor", async ({ page }) => {
    await page.locator(ANCHOR).hover();
    await expect(page.locator(TOOLTIP)).toBeVisible();

    const anchorBox = (await page.locator(ANCHOR).boundingBox())!;
    const tooltipBox = (await page.locator(TOOLTIP).boundingBox())!;

    expect(
        tooltipBox.y + tooltipBox.height <= anchorBox.y,
        "a top-out placement puts the whole tooltip above the anchor, not overlapping it",
    ).toBe(true);
});

test("moving the pointer away withdraws both the tooltip and the description", async ({ page }) => {
    await page.locator(ANCHOR).hover();
    await expect(page.locator(TOOLTIP)).toBeVisible();

    await page.locator(OTHER).hover();
    await expect(page.locator(TOOLTIP), "moving the pointer away hides it").toHaveCount(0);
    await expect(
        page.locator(ANCHOR),
        "and the description is withdrawn rather than left pointing at a node that has gone",
    ).not.toHaveAttribute("aria-describedby");
});

test("Escape dismisses it while the pointer is still over the anchor", async ({ page }) => {
    await page.locator(ANCHOR).focus();
    await page.locator(ANCHOR).hover();
    await expect(page.locator(TOOLTIP), "it is showing").toBeVisible();

    await page.keyboard.press("Escape");
    await expect(
        page.locator(TOOLTIP),
        "Escape dismisses it while the pointer is still over the anchor, so it can be got out of the way",
    ).toHaveCount(0);
});
