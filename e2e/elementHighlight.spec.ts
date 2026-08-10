import { type Page, expect, test } from "@playwright/test";

const TRIGGER = "button:not([role])";

/**
 * Both triggers sit inside a container running a looping CSS slide, so they never stop moving and
 * Playwright's stability check can never pass — a pointer click here waits out the full timeout. Focus
 * and Enter need no geometry at all, and a keyboard user reaching a moving button is the same journey.
 */
const activate = async (page: Page, index: number) => {
    await page.locator(TRIGGER).nth(index).focus();
    await page.keyboard.press("Enter");
};

/**
 * The overlay is portalled and every one of its parts is styled through a hashed class, so the two
 * selectors here key on what the geometry actually produces: the five segments that measure themselves
 * against the viewport with `calc(100% - …)`, and the four corner polygons the consumer's
 * `renderHighlight` draws. Neither appears anywhere on this page until the highlight opens.
 */
const VIEWPORT_SEGMENTS = 'div[style*="calc(100% - "]';
const HIGHLIGHT_CORNERS = "svg polygon";

test.beforeEach(async ({ page }) => {
    await page.goto("/element-highlight");
    await expect(page.locator(TRIGGER).first()).toBeVisible();
});

test("nothing is portalled before anything is highlighted", async ({ page }) => {
    await expect(page.locator(VIEWPORT_SEGMENTS), "no overlay segments").toHaveCount(0);
    await expect(page.locator(HIGHLIGHT_CORNERS), "and no highlight decoration").toHaveCount(0);
});

test("opening cuts the overlay into segments around the element", async ({ page }) => {
    await activate(page, 0);

    await expect(
        page.locator(VIEWPORT_SEGMENTS),
        "the five segments whose far edge is the viewport rather than a known size",
    ).toHaveCount(5);
    await expect(
        page.locator(HIGHLIGHT_CORNERS),
        "and the consumer's renderHighlight draws its four corners over the hole",
    ).toHaveCount(4);
});

test("the hole is the element plus the padding the consumer asked for", async ({ page }) => {
    await activate(page, 0);
    await expect(page.locator(HIGHLIGHT_CORNERS).first()).toBeAttached();

    const decoration = await page
        .locator(HIGHLIGHT_CORNERS)
        .first()
        .evaluate((polygon) => {
            const box = polygon.closest("div")!.parentElement!.parentElement!;

            return { width: box.offsetWidth, height: box.offsetHeight };
        });

    const container = await page
        .locator(TRIGGER)
        .first()
        .evaluate((button) => {
            const box = button.parentElement!;

            return { width: box.offsetWidth, height: box.offsetHeight };
        });

    expect(
        decoration.width - container.width,
        "getPadding returns 20, which has to be applied on both sides rather than once",
    ).toBe(40);
    expect(
        decoration.height - container.height,
        "and both boxes are read in layout space, since a client rect carries the Viewport's scale",
    ).toBe(40);
});

test("Escape closes it from anywhere on the page", async ({ page }) => {
    await activate(page, 0);
    await expect(page.locator(HIGHLIGHT_CORNERS)).toHaveCount(4);

    await page.keyboard.press("Escape");
    await expect(page.locator(HIGHLIGHT_CORNERS), "Escape closes it").toHaveCount(0);
    await expect(page.locator(VIEWPORT_SEGMENTS), "and the overlay leaves with it").toHaveCount(0);
});

test("it re-anchors to a second element rather than staying on the first", async ({ page }) => {
    await activate(page, 0);
    await expect(page.locator(HIGHLIGHT_CORNERS)).toHaveCount(4);

    await page.keyboard.press("Escape");
    await expect(page.locator(HIGHLIGHT_CORNERS)).toHaveCount(0);

    await activate(page, 1);
    await expect(
        page.locator(HIGHLIGHT_CORNERS),
        "a second trigger opens the same overlay against its own element",
    ).toHaveCount(4);
});
