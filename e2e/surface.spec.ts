import { expect, test } from "@playwright/test";

import { example, inlineStyle } from "./helpers";

const CARD = example("card");
const CARD_ROOT = `${CARD} div[style*="border-radius"]`;
const AVATAR = example("avatar");
const DIALOG = '[role="dialog"]';

/**
 * `Surface` picks one of two render paths from its defs, and which one it picked is the only thing about
 * it that is observable without looking at the pixels.
 */
test.beforeEach(async ({ page }) => {
    await page.goto("/surface");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("the page renders all three examples", async ({ page }) => {
    await expect(page.locator("[data-example]"), "the page renders all three examples").toHaveCount(3);
});

test("plain colours take the div path", async ({ page }) => {
    await expect(
        page.locator(`${CARD} svg`),
        "a surface whose fill and stroke are plain colours takes the div path and draws no SVG",
    ).toHaveCount(0);
    expect(
        await inlineStyle(page.locator(CARD_ROOT).first(), "border-radius"),
        "its radii arrive as inline values on the div rather than through a generated stylesheet",
    ).toBe("20px");
    expect(
        (await page.locator(CARD_ROOT).first().getAttribute("style"))?.includes("--"),
        "and so does its fill, as a custom property the consumer's colour is assigned into",
    ).toBe(true);
    await expect(page.locator(`${CARD} img`), "and it still renders the consumer's children").toHaveCount(1);
});

test("a gradient stroke takes the SVG path and clips its children", async ({ page }) => {
    expect(
        await page.locator(`${AVATAR} svg`).count(),
        "a surface with a gradient stroke takes the SVG path instead",
    ).toBeGreaterThan(0);
    expect(
        (await page.locator(`${AVATAR} svg linearGradient`).count()) +
            (await page.locator(`${AVATAR} svg radialGradient`).count()),
        "and the gradient the consumer asked for is actually in the defs",
    ).toBeGreaterThan(0);
    expect(
        await inlineStyle(page.locator(`${AVATAR} div[style*="clip-path"]`).first(), "clip-path"),
        "children on the SVG path are clipped to the shape rather than overflowing its corners",
    ).toBeTruthy();
    await expect(page.locator(`${AVATAR} img`), "and they render too").toHaveCount(1);
});

test("the source button opens a modal named after its example", async ({ page }) => {
    await page.locator("#cardSource").click();

    await expect(
        page.locator(DIALOG),
        "the source button opens a modal named after the example it belongs to",
    ).toHaveAttribute("aria-label", "Card source code");

    await page.keyboard.press("Escape");
    await expect(page.locator(DIALOG), "and Escape closes it").toHaveCount(0);
});
