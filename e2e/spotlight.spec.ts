import { type Page, expect, test } from "@playwright/test";

import { activeText, readout, variant } from "./helpers";

const HINT = variant("Hint");
const PROMPT = variant("Prompt");
const GUIDE = variant("Guide");

const SETTLE_MS = 300;

/**
 * The overlay is portalled and every part of it is styled through a hashed class, so these key on what the
 * geometry produces rather than on names: the segments measure themselves against the viewport with
 * `calc(100% - …)`, and the corner polygons are what the consumer's `renderHighlight` draws.
 */
const SEGMENTS = 'div[style*="calc(100% - "]';
const CORNERS = "svg polygon";
const POPUP = '[role="dialog"]';

const button = (scope: string, name: string) => `${scope} button:has-text("${name}")`;

/** The popup is portalled out of its variant container, so its own buttons are scoped to the dialog. */
const popupButton = (name: string) => `${POPUP} button:has-text("${name}")`;

const isFocusInsidePopup = (page: Page) =>
    page.evaluate(() => {
        const popup = document.querySelector('[role="dialog"]');

        return !!popup && !!document.activeElement && popup.contains(document.activeElement);
    });

/**
 * The hint's own triggers sit inside a container running a looping CSS slide, so they never stop moving and
 * Playwright's stability check can never pass — a pointer click there waits out the full timeout. Focus and
 * Enter need no geometry, and a keyboard user reaching a moving button is the same journey.
 */
const pressByKeyboard = async (page: Page, selector: string) => {
    await page.locator(selector).first().focus();
    await page.keyboard.press("Enter");
};

test.beforeEach(async ({ page }) => {
    await page.goto("/spotlight");
    await expect(page.locator(button(HINT, "Highlight Me")).first()).toBeVisible();
});

test("nothing is portalled before anything is highlighted", async ({ page }) => {
    await expect(page.locator(SEGMENTS), "no overlay segments").toHaveCount(0);
    await expect(page.locator(CORNERS), "and no highlight decoration").toHaveCount(0);
});

test("opening cuts the overlay into segments around the element", async ({ page }) => {
    await pressByKeyboard(page, button(HINT, "Highlight Me"));

    await expect(
        page.locator(SEGMENTS),
        "the five segments whose far edge is the viewport rather than a known size",
    ).toHaveCount(5);
    await expect(page.locator(CORNERS), "and the consumer's four corner marks").toHaveCount(4);
});

/**
 * A hint yields to anything. It is the one mode that treats a keypress as "you have moved on" rather than as
 * something to swallow — but a bare modifier is not moving on, and a screen reader's virtual cursor would
 * otherwise kill the hint before it was read.
 */
test("a hint is dismissed by a real key and survives a bare modifier", async ({ page }) => {
    await pressByKeyboard(page, button(HINT, "Highlight Me"));
    expect(await readout(page, "Hint")).toContain("open: true");

    await page.keyboard.down("Shift");
    await page.keyboard.up("Shift");
    expect(await readout(page, "Hint"), "holding Shift is not moving on").toContain("open: true");

    await page.keyboard.press("a");
    expect(await readout(page, "Hint"), "but a key that means something is").toContain("open: false");
});

test("a prompt refuses every other control until the highlighted one is used", async ({ page }) => {
    await page.locator(button(PROMPT, "Insist")).click();
    await expect(page.locator(SEGMENTS)).toHaveCount(5);

    await page
        .locator(button(PROMPT, "Insist"))
        .click({ force: true, timeout: 2000 })
        .catch(() => undefined);
    expect(await readout(page, "Prompt"), "the trigger behind the overlay is unreachable").toContain("bought: 0");

    await page.keyboard.press("Tab");
    expect(await activeText(page), "and focus is pulled back to the one live control").toContain("Buy the potato");

    await page.locator(button(PROMPT, "Buy the potato")).click();
    expect(await readout(page, "Prompt"), "using it is the way out").toContain("bought: 1");
});

/**
 * WCAG 2.1.2 is Level A and permits trapping focus only while a standard exit remains, so the mode whose
 * whole promise is that you cannot do anything else still has to answer Escape. This is that guarantee.
 */
test("a prompt still answers Escape, which is what keeps it out of a keyboard trap", async ({ page }) => {
    await page.locator(button(PROMPT, "Insist")).click();
    await expect(page.locator(SEGMENTS)).toHaveCount(5);

    await page.keyboard.press("Escape");

    await expect(page.locator(SEGMENTS), "the spotlight is gone").toHaveCount(0);
    expect(await readout(page, "Prompt"), "without the highlighted control ever being used").toContain("bought: 0");
});

test("a guide seals the page and puts focus in its own popup", async ({ page }) => {
    await page.locator(button(GUIDE, "Take the tour")).click();
    await expect(page.locator(POPUP)).toBeVisible();
    await page.waitForTimeout(SETTLE_MS);

    await expect(page.locator(POPUP), "the popup names itself as a modal dialog").toHaveAttribute("aria-modal", "true");
    expect(await isFocusInsidePopup(page), "and focus lands inside it").toBe(true);

    const inertCount = await page.locator("[inert]").count();

    expect(inertCount, "everything beside the portal is inert, so the page is out of reach entirely").toBeGreaterThan(
        0,
    );
});

test("a guide steps between elements and reports how it ended", async ({ page }) => {
    await page.locator(button(GUIDE, "Take the tour")).click();
    await expect(page.locator(POPUP)).toBeVisible();

    expect(await readout(page, "Guide"), "it starts on the first step").toContain("step: 1 of 2");
    await expect(page.locator(POPUP)).toContainText("This is a potato");

    await page.locator(popupButton("Next")).click();

    expect(await readout(page, "Guide"), "Next advances it").toContain("step: 2 of 2");
    expect(
        await activeText(page),
        "and focus stays where the reader put it — a step change must not throw them onto Skip all",
    ).toContain("Done");
    await expect(page.locator(POPUP), "and the popup follows to the next element").toContainText("turnip");

    await page.locator(popupButton("Done")).click();

    await expect(page.locator(POPUP), "finishing closes it").toHaveCount(0);
    expect(await readout(page, "Guide")).toContain("finished");
    await expect(page.locator("[inert]"), "and the page is handed back").toHaveCount(0);
});

test("a guide can be abandoned, and says so", async ({ page }) => {
    await page.locator(button(GUIDE, "Take the tour")).click();
    await expect(page.locator(POPUP)).toBeVisible();

    await page.locator(popupButton("Skip all")).click();

    await expect(page.locator(POPUP)).toHaveCount(0);
    expect(await readout(page, "Guide")).toContain("skipped");
});
