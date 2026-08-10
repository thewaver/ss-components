import { expect, test } from "@playwright/test";

import { activeText, offsetHeight, readout, tabIndex, variant } from "./helpers";

const MULTI = variant("Many open at once");
const SINGLE = variant("One at a time");
const GROWING = variant("Content that grows while open");

/**
 * The panel is measured through two boxes on purpose: the one carrying `role="region"` is the constrained
 * box the library animates, and its only child is the unconstrained content the height is animated
 * towards. Comparing the two is the whole contract, and it is why a collapsed panel still has content
 * with a height.
 */
const header = (scope: string) => `${scope} button[aria-expanded]`;
const panel = (scope: string) => `${scope} [role="region"]`;

const TRANSITION_TIMEOUT_MS = 5_000;

test.beforeEach(async ({ page }) => {
    await page.goto("/accordion");
    await expect(page.locator(header(MULTI)).first()).toBeVisible();
});

test("each section is a heading, a button and a region wired to each other", async ({ page }) => {
    await expect(
        page.locator(`${MULTI} h3`),
        "every header sits in a heading, so the page keeps an outline",
    ).toHaveCount(4);

    const controls = await page.locator(header(MULTI)).first().getAttribute("aria-controls");
    const labelledBy = await page.locator(panel(MULTI)).first().getAttribute("aria-labelledby");

    expect(await page.locator(`#${controls}`).getAttribute("role"), "the header points at the region it opens").toBe(
        "region",
    );
    expect(
        await page.locator(`#${labelledBy}`).getAttribute("aria-expanded"),
        "and the region points back at the header that names it",
    ).toBe("true");
});

test("a collapsed panel is inert and takes no height, while its content stays measurable", async ({ page }) => {
    await expect(
        page.locator(panel(MULTI)).nth(1),
        "a collapsed panel is inert, so nothing in it is reachable",
    ).toHaveAttribute("inert", "");
    expect(await offsetHeight(page.locator(panel(MULTI)).nth(1)), "and it takes no height").toBe(0);
    expect(
        await offsetHeight(page.locator(panel(MULTI)).nth(1).locator("> *")),
        "but the content inside it still has one, which is what the panel animates towards",
    ).toBeGreaterThan(0);
});

test("opening a section animates it to its content's own height", async ({ page }) => {
    const target = await offsetHeight(page.locator(panel(MULTI)).nth(1).locator("> *"));

    await page.locator(header(MULTI)).nth(1).click();

    await expect(page.locator(header(MULTI)).nth(1)).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(panel(MULTI)).nth(1)).not.toHaveAttribute("inert");
    await expect
        .poll(() => offsetHeight(page.locator(panel(MULTI)).nth(1)), { timeout: TRANSITION_TIMEOUT_MS })
        .toBe(target);
});

test("many stay open at once, and the owner's list says which", async ({ page }) => {
    await page.locator(header(MULTI)).nth(1).click();
    await page.locator(header(MULTI)).nth(2).click();

    expect(await readout(page, "Many open at once"), "every opened section is in the list").toContain(
        '["Shipping","Returns","Warranty"]',
    );

    await page.locator(header(MULTI)).nth(0).click();
    expect(await readout(page, "Many open at once"), "and closing one removes only that one").toContain(
        '["Returns","Warranty"]',
    );
});

test("single-expand mode closes the previous section itself", async ({ page }) => {
    await page.locator(header(SINGLE)).nth(0).click();
    expect(await readout(page, "One at a time")).toContain('["Shipping"]');

    await page.locator(header(SINGLE)).nth(1).click();
    expect(
        await readout(page, "One at a time"),
        "the component drops the previous value rather than the consumer",
    ).toContain('["Returns"]');

    await expect
        .poll(() => offsetHeight(page.locator(panel(SINGLE)).nth(0)), { timeout: TRANSITION_TIMEOUT_MS })
        .toBe(0);
});

test("an open panel follows content that appears after it opened", async ({ page }) => {
    const before = await offsetHeight(page.locator(panel(GROWING)).first());

    await page.locator(`${GROWING} button`, { hasText: "Add a line" }).click();

    await expect
        .poll(() => offsetHeight(page.locator(panel(GROWING)).first()), { timeout: TRANSITION_TIMEOUT_MS })
        .toBeGreaterThan(before);
});

test("arrows and the edge keys walk the headers, skipping the disabled one", async ({ page }) => {
    await page.locator(header(MULTI)).nth(0).focus();

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "ArrowDown moves to the next header").toContain("Returns");

    await page.keyboard.press("End");
    expect(await activeText(page), "End lands on the last enabled header, not the disabled one after it").toContain(
        "Warranty",
    );

    await page.keyboard.press("ArrowDown");
    expect(await activeText(page), "and the walk wraps past the disabled header rather than stopping").toContain(
        "Shipping",
    );
});

test("a disabled header carries no native attribute and cannot open its panel", async ({ page }) => {
    await expect(page.locator("button[disabled]"), "no header uses the native disabled attribute").toHaveCount(0);
    await expect(page.locator(header(MULTI)).nth(3)).toHaveAttribute("aria-disabled", "true");
    expect(await tabIndex(page.locator(header(MULTI)).nth(3)), "and it is out of the tab order").toBe(-1);

    await page.locator(header(MULTI)).nth(3).dispatchEvent("click");

    await expect(page.locator(header(MULTI)).nth(3), "clicking it changes nothing").toHaveAttribute(
        "aria-expanded",
        "false",
    );
    expect(await offsetHeight(page.locator(panel(MULTI)).nth(3))).toBe(0);
});
