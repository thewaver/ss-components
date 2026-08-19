import { expect, test } from "@playwright/test";

import { activeMatches, attributesOf, demo, inlineStyle, readout } from "./helpers";

const DEFAULT = demo("default");
const REACHABLE = demo("reachable");
const DISABLED = demo("disabled");
const SEGMENTED = demo("segmented");

const option = (scope: string, label: string) => `${scope} input[aria-label="${label}"]`;

test.beforeEach(async ({ page }) => {
    await page.goto("/radio");
    await expect(page.locator("[data-example]").first()).toBeVisible();
});

test("a group is named on its own element and uses no native disabled", async ({ page }) => {
    await expect(
        page.locator(`${DEFAULT} [role="radiogroup"]`),
        "the group is named on its own element",
    ).toHaveAttribute("aria-label", "Default size");
    await expect(page.locator("input[disabled]"), "no radio carries the native disabled attribute").toHaveCount(0);
});

test("a group is one tab stop that travels with the selection", async ({ page }) => {
    expect(
        await attributesOf(page, `${DEFAULT} input`, "tabindex"),
        "a group is one tab stop, and it starts on the first navigable radio",
    ).toEqual(["0", "-1", "-1"]);

    await page.locator(option(DEFAULT, "Small")).focus();
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "default"), "an arrow both moves and selects").toContain("value: medium");
    expect(await activeMatches(page, option(DEFAULT, "Medium")), "and focus follows the selection").toBe(true);
    expect(await attributesOf(page, `${DEFAULT} input`, "tabindex"), "the single tab stop moves with it").toEqual([
        "-1",
        "0",
        "-1",
    ]);
});

test("the walk wraps and honours the edge keys", async ({ page }) => {
    await page.locator(option(DEFAULT, "Small")).focus();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "default"), "the walk wraps around the end").toContain("value: small");

    await page.keyboard.press("End");
    expect(await readout(page, "default"), "End jumps to the last radio").toContain("value: large");

    await page.keyboard.press("Home");
    expect(await readout(page, "default"), "Home jumps back to the first").toContain("value: small");
});

test("a wholly disabled group has no tab stop at all", async ({ page }) => {
    expect(
        await attributesOf(page, `${DISABLED} input`, "tabindex"),
        "a group whose every radio is disabled has no tab stop at all",
    ).toEqual(["-1", "-1", "-1"]);
});

test("the walk stops on a reachable disabled radio without selecting it", async ({ page }) => {
    await page.locator(option(REACHABLE, "Small")).focus();
    await page.keyboard.press("ArrowRight");
    expect(
        await activeMatches(page, option(REACHABLE, "Medium")),
        "the walk stops on a disabled radio that is reachable, so its tooltip can be read",
    ).toBe(true);
    expect(await readout(page, "reachable"), "and refuses to select it while it is there").toContain("value: small");

    await page.keyboard.press("ArrowRight");
    expect(await readout(page, "reachable"), "carrying on from it selects the next enabled radio").toContain(
        "value: large",
    );

    await page.locator(option(REACHABLE, "Medium")).click({ force: true });
    expect(
        await readout(page, "reachable"),
        "clicking a reachable disabled radio leaves the value alone too",
    ).toContain("value: large");
});

/**
 * The floater is the group's, not the painter's: `RadioGroup` measures the selected radio's wrapper and
 * writes the box as inline `top` / `left` / `width` / `height`, and the consumer only paints inside it.
 * So what is asserted here is the measurement, read off the wrapper the library positions — the painted
 * child carries a hashed class and says nothing about where it is.
 *
 * The first assertion is the one that catches a floater that mounted but never measured: a box still
 * sitting at its initial empty style would pass a visibility check and fail this. The second is the
 * movement itself, polled because the position is written from a `ResizeObserver` callback rather than
 * synchronously with the click.
 *
 * A group with no `renderFloater` runs no observer at all, which is why only this variant has a box to
 * find; `Default` is checked for its absence so that the guard cannot quietly stop guarding.
 */
const FLOATER_TIMEOUT_MS = 5_000;

test("the floater is measured from the selected radio and moves with it", async ({ page }) => {
    await expect(
        page.locator(`${DEFAULT} [data-floater]`),
        "a group that passes no floater renders none, and runs no observer for one",
    ).toHaveCount(0);

    const box = page.locator(`${SEGMENTED} [data-floater]`).locator("..");
    const before = await inlineStyle(box, "left");

    expect(before, "the floater is placed off a real measurement rather than left at zero").not.toBe("");

    await page.locator(option(SEGMENTED, "Large")).click();

    await expect.poll(() => inlineStyle(box, "left"), { timeout: FLOATER_TIMEOUT_MS }).not.toBe(before);
    expect(await readout(page, "segmented"), "and the value moved with it").toContain("value: large");
});

test("each group generates its own name", async ({ page }) => {
    const names = await attributesOf(page, "input[type='radio']", "name");

    expect(new Set(names).size, "each group generates its own name, so the browser cannot mix two of them").toBe(7);
});
